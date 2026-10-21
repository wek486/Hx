import {createRouter,createWebHistory,createWebHashHistory} from 'vue-router'
// component:()=>import('@/views/setting.vue'),也可以换成import setting from '@/views/setting.vue'，但是这样会在一开始就加载所有的组件，影响性能，所以一般都是用懒加载的方式
//记得安装vue-router@4.2.2版本，npm install vue-router@4.2.2，如果是外部的不是自己定义的内容一般都要安装对应的包
const router=createRouter({
    history: (import.meta.env.VITE_ROUTER_MODE === "hash" ? createWebHashHistory : createWebHistory)(import.meta.env.BASE_URL),
    routes:[
    {path:'/',name:'index',component:()=>import('@/layout/frame.vue'),
        redirect:'/find',//重定向到find页面
    children: [
        {path:'/find',name:'find',component:()=>import('@/views/find.vue')},
        {path:'/account',name:'account',component:()=>import('@/views/account.vue')},
        {path:'/messages',name:'messages',component:()=>import('@/views/messages.vue')},
        {path:'/searchPage',name:'searchPage',component:()=>import('@/views/search_page.vue')
        },
        {path:'/review',name:'review',component:()=>import('@/views/review.vue')},
        {path:'/likes',name:'liked',component:()=>import('@/views/liked.vue')},
        {path:'/stars',name:'stars',component:()=>import('@/views/stars.vue')},
        {path:'/update_avator',alias:'/update_avatar',name:'update_avatar',component:()=>import('@/views/update_avator.vue')},
        {path:'/setting',alias:'/settings',name:'setting',component:()=>import('@/views/setting.vue')}

    ]
    },
    {
        path:'/login',name:'login',component:()=>import('@/views/login.vue')},
    {path:'/register',name:'register',component:()=>import('@/views/register.vue')},
    // 记得隔开，不然就是覆盖了
    {
        path:'/logout',name:'logout',component:()=>import('@/views/logout.vue')
    }
]
})
export default router