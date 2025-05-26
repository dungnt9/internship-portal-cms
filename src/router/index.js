import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'trang-chu',
      component: () => import('../views/HomeView.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
    {
      path: '/dang-nhap',
      name: 'dang-nhap',
      component: () => import('../views/LoginView.vue'),
      meta: { layout: 'default', requiresGuest: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/user/Admin.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
    {
      path: '/teacher',
      name: 'teacher',
      component: () => import('../views/user/Teacher.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
    {
      path: '/student',
      name: 'student',
      component: () => import('../views/user/Student.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
    {
      path: '/company-contact',
      name: 'company-contact',
      component: () => import('../views/user/companyContact.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
    {
      path: '/company',
      name: 'company',
      component: () => import('../views/user/Company.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
    {
      path: '/external-internship',
      name: 'external-internship',
      component: () => import('../views/registration/ExternalInternship.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
    {
      path: '/internship-period',
      name: 'internship-period',
      component: () => import('../views/registration/InternshipPeriod.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
    {
      path: '/internship-application',
      name: 'internship-application',
      component: () => import('../views/registration/InternshipApplication.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
    {
      path: '/internship-progress',
      name: 'internship-progress',
      component: () => import('../views/registration/InternshipProgress.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
    {
      path: '/internship-report',
      name: 'internship-report',
      component: () => import('../views/evaluation/InternshipReport.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
    {
      path: '/evaluation-criteria',
      name: 'evaluation-criteria',
      component: () => import('../views/evaluation/EvaluationCriteria.vue'),
      meta: { layout: 'default', requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = Cookies.get('token')

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      const authStore = useAuthStore()
      authStore.clearAuth()
      next({ name: 'dang-nhap' })
    } else {
      next()
    }
  } else if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (token) {
      next({ name: 'trang-chu' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
