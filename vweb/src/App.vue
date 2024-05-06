<template>
  <n-config-provider :theme="themes">
    <router-view />
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useColorMode } from "@vueuse/core";
import { NConfigProvider, darkTheme, lightTheme } from "naive-ui";

const mode = useColorMode();

const themes = computed(() => {
  return mode.value === "dark" ? darkTheme : lightTheme;
});
</script>
