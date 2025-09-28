import { createApp } from "vue";
import App from "./App.vue";
import "./styles/main.scss";
import { createPinia } from "pinia";
import router from "./router";

import clickOutsideDirective from "./directives/clickOutside";

const app = createApp(App);
const pinia = createPinia();

app.directive("click-outside", clickOutsideDirective);
app.use(pinia);
app.use(router);
app.mount("#app");
