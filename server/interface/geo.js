import Router from 'koa-router'
import axios from './utils/axios'
import Province from '../dbs/models/province'

let router = new Router({ prefix: '/geo' })

// const sign = 'abcd'

router.get('/getPosition', async (ctx) => {
    let { status, data: { province, city } } = await axios.get(`http://cp-tools.cn/geo/getPosition`)
    if (status === 200) {
        ctx.body = {
            province,
            city
        }
    } else {
        ctx.body = {
            province: '',
            city: ''
        }
    }
})

router.get('/province', async (ctx) => {
    // let province = await Province.find()
    // ctx.body = {
    //     province: province.map(item => {
    //         return {
    //             id: item.id,
    //             name: item.value[0]
    //         }
    //     })
    // }
    let { status, data: { province } } = await axios.get(`http://cp-tools.cn/geo/province`)
    ctx.body = {
        province: status === 200 ? province : []
    }
})


router.get('/province/:id', async (ctx) => {
    let { status, data: { city } } = await axios.get(`http://cp-tools.cn/geo/province/${ctx.params.id}`)
    if (status === 200) {
        ctx.body = {
            city
        }
    } else {
        ctx.body = {
            city: []
        }
    }
})

router.get('/city', async (ctx) => {
    let { status, data: {
        city
    } } = await axios.get(`http://cp-tools.cn/geo/city`);
    if (status === 200) {
        ctx.body = {
            city
        }
    } else {
        ctx.body = {
            city: []
        }
    }
})

router.get('/hotCity', async (ctx) => {
    let { status, data: {
        hots
    } } = await axios.get(`http://cp-tools.cn/geo/hotCity`);
    if (status === 200) {
        ctx.body = {
            hots
        }
    } else {
        ctx.body = {
            hots: []
        }
    }
})

router.get('/menu', async (ctx) => {
    let { status, data: { menu } } = await axios.get(`http://cp-tools.cn/geo/menu`)
    if (status === 200) {
        ctx.body = {
            menu
        }
    } else {
        ctx.body = {
            menu: ''
        }
    }
})

export default router