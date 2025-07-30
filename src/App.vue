<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>

<style>
#app {
  padding: 30px 20px;
}

@media (max-width: 590px) {
  #app {
    padding: 15px 10px;
  }
}
</style>
