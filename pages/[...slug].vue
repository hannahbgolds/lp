<template>
  <div class="page index-page">
    <NuxtImg
      src="/images/logo-vertical-branca.svg"
      class="logo"
      alt="Hemocione Logo"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});
</script>

<style scoped>
.index-page {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.logo {
  height: 60%;
  max-width: 80%;
}
</style>
