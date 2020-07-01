import Router from 'koa-router'
import Redis from 'koa-redis'
import nodeMailer from 'nodemailer'
import User from '../dbs/models/users'
import Passport from './utils/passport'
import Email from '../dbs/config'
import axios from './utils/axios'

let router = new Router({
    prefix: '/users'
})

let Store = new Redis().client

/* 注册接口 */
router.post('/signup', async (ctx) => {
    const {
        username,
        password,
        email,
        code
    } = ctx.request.body
    /* 对验证码进行校验 */
    if (code) {
        const saveCode = await Store.hget(`nodemail:${username}`, 'code')
        const saveExpire = await Store.hget(`nodemail:${username}`, 'expire')
        if (code === saveCode) {
            if (new Date().getTime() - saveExpire > 0) {
                ctx.body = {
                    code: -1,
                    msg: '验证码已过期，请重新尝试'
                }
                return false
            }
        } else {
            ctx.body = {
                code: -1,
                msg: '请填写正确的验证码'
            }
        }
    } else {
        ctx.body = {
            code: -1,
            msg: '请填写验证码'
        }
    }
    let user = await User.find({
        username
    })
    if (user.length) {
        ctx.body = {
            code: -1,
            msg: '已被注册'
        }
        return
    }
    /* 验证码通过且用户名没有被注册过 */
    /* 创建一个写库操作 */
    let nuser = await User.create({
        username,
        password,
        email
    })
    /* 检查有没有成功写库 */
    if (nuser) {
        /* 写库成功，就进行登录操作，自动登录 */
        let res = await axios.post('/users/signin', {
            username,
            password
        })
        /* 如果有返回 */
        if (res.data && res.data.code === 0) {
            ctx.body = {
                code: 0,
                msg: '注册成功',
                /* 返回用户名 */
                user: res.data.user
            }
        } else {
            /* 登录异常 */
            ctx.body = {
                code: -1,
                msg: 'error'
            }
        } 
    } else {
        /* 写库写失败了 */
        ctx.body = {
            code: -1,
            msg: '注册失败'
        }
    }
})

/* 登录接口 */
router.post('/signin', async (ctx, next) => {
    return Passport.authenticate('local', function (err, user, info, status) {
        if (err) {
            ctx.body = {
                code: -1,
                msg: err
            }
        } else {
            if (user) {
                ctx.body = {
                    code: 0,
                    msg: '登陆成功',
                    user
                }
                return ctx.login(user)
            } else {
                ctx.body = {
                    code: 1,
                    msg: info
                }
            }
        }
    })(ctx, next)
})

/* 验证码验证 */
router.post('/verify', async (ctx, next) => {
    let username = ctx.request.body.username
    const saveExpire = await Store.hget(`nodemail:${username}`, 'expire')
    /* 限制频繁刷接口，做拦截，判断时间 */
    if (saveExpire && new Date().getTime() - saveExpire < 0) {
        ctx.body = {
            code: -1,
            msg: '验证请求过于频繁，1分钟内1次'
        }
        return false
    }
    /* 发送对象信息 */
    let transporter = nodeMailer.createTransport({
        host: Email.smtp.host,
        port: 587,
        secure: false,
        auth: {
            user: Email.smtp.user,
            pass: Email.smtp.pass
        }
    })
    /* 接受对象信息 */
    let ko = {
        code: Email.smtp.code(),
        expire: Email.smtp.expire(),
        email: ctx.request.body.email,
        user: ctx.request.body.username
    }
    /* 邮件显示信息 */
    let mailOptions = {
        from: `"认证邮件"<${Email.smtp.user}>`,
        to: ko.email,
        subject: '美团注册码',
        html: `您在美团网上注册，您的邀请码为${ko.code}`
    }
    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('error')
        } else {
            /* 成功，在redis中存储数据 */
            Store.hmset(`nodemail:${ko.user}`, 'code', ko.code, 'expire', ko.expire, 'email', ko.email)
        }
    })
    /* 存储完毕之后进行数据响应 */
    ctx.body = {
        code: 0,
        msg: '验证码已发送，可能会有延时，有效期一分钟'
    }
})

/* 退出接口,退出用get也没问题，不存在数据问题 */
router.get('/exit', async (ctx, next) => {
    /* 注销的动作 */
    await ctx.logout()
    /* 二次验证，检查现在是不是登录状态 */
    if (!ctx.isAuthenticated()) {
        ctx.body = {
            code: 0
        }
    } else {
        ctx.body = {
            code: -1
        }
    }
})

/* 获取用户名接口 */
router.get('/getUser', async (ctx) => {
    /* 检查是不是登录状态，如果是登录状态，就从session中取出结果 */
    /* isAuthenticated() => passport固定的API */
    if (ctx.isAuthenticated()) {
        const { username, email } = ctx.session.passport.user
        ctx.body = {
            user: username,
            email
        }
    } else {
        ctx.body = {
            user: '',
            email: ''
        }
    }
})

export default router