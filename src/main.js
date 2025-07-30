import { createApp } from "vue";
import App from "./App.vue";
import "./styles/main.scss";
import { createPinia } from "pinia";
import router from "./router";

import clickOutside from "./directives/clickOutside";

const app = createApp(App);
const pinia = createPinia();

app.directive("click-outside", clickOutside);
app.use(pinia);
app.use(router);
app.mount("#app");
