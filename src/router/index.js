import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    name: "Home",
    path: "/",
    component: () => import("../views/Home.vue"),
  },
  {
    name: "PlaceDetails",
    path: "/place/:id",
    component: () => import("../views/PlaceDetails.vue"),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
