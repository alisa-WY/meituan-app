import Router from 'koa-router'
import axios from './utils/axios'
import Cart from '../dbs/models/cart'
import Order from '../dbs/models/order'
import md5 from 'crypto-js'

let router = new Router({ prefix: '/order' })

router.post('/createOrder', async ctx => {
    let { id, price, count } = ctx.request.body
    let time = Date()
    let orderID = md5(Math.random() * 1000 + time).toString()
    if (!ctx.isAuthenticated()) {
        ctx.body = {
            code: -1,
            msg: 'please login'
        }
    } else {
        /* 查购物车id */
        let findCart = await Cart.findOne({
            cartNo: id
        })
        /* 创建一个订单 */
        let order = new Order({
            id: orderID,
            count,
            total: price * count,
            time,
            user: ctx.session.passport.user,
            name: findCart.detail[0].name,
            imgs: findCart.detail[0].imgs,
            status: 0
        })
        /* 以上是创建实例，下面入库 */
        try {
            /* 入库 */
            let result = await order.save()
            if (result) {
                /* 购物车是一个临界状态，用完删掉 */
                await findCart.remove()
                ctx.body = {
                    code: 0,
                    /* 把订单id传过去 */
                    id: orderID
                }
            } else {
                ctx.body = {
                    code: -1
                }
            }
        } catch (e) {
            ctx.body = {
                code: -1
            }
        }
    }
})

/* 获取所有的订单 */
router.post('/getOrders', async ctx => {
    if (!ctx.isAuthenticated()) {
        ctx.body = {
            code: -1,
            list: [],
            msg: 'please login'
        }
    } else {
        try {
            let result = await Order.find()
            if (result) {
                ctx.body = {
                    code: 0,
                    list: result
                }
            } else {
                ctx.body = {
                    code: -1,
                    list: []
                }
            }
        } catch (e) {
            ctx.body = {
                code: -1,
                list: []
            }
        }
    }
})

export default router