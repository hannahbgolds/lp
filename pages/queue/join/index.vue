<script setup lang="ts">
definePageMeta({
  layout: "no-scroll",
});

const route = useRoute();
const query = route.query;
const { eventId, eventRef, leadId, uuid } = query;
const shouldRedirect = !eventId;

// TODO: read fbc and fbp -- need to install meta pixel (how?)
// TODO: add mask to number!
// TODO: whatsapp instead of SMS

const initialPhone = eventRef ? String(eventRef) : "";

const disablePhone = initialPhone.length === 11;

if (shouldRedirect) await navigateTo("/queue/not-found");

const { data: eventConfig } = shouldRedirect
  ? { data: undefined }
  : await useFetch(`/api/v1/event/${eventId}`);

useHead({
  title: `Fila de Doação Hemocione | ${eventConfig?.value?.name ?? eventId}`,
});
if (!eventConfig?.value) await navigateTo("/queue/not-found");

const form = ref({
  phone: initialPhone,
  name: "",
});

const buttonLoading = ref(false);

const allowClick = computed(() => {
  const { phone, name } = form.value;
  return phone.length === 11 && name.length > 2;
});

async function onSubmit() {
  const { phone, name } = form.value;
  const payload = {
    phone,
    name,
    leadId,
    uuid,
  };
  try {
    const queueId = eventConfig?.value?.queue?._id;
    if (!queueId) throw new Error("Queue not found");

    buttonLoading.value = true;
    await $fetch(`/api/v1/event/${eventId}/queue/${queueId}/participant`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await navigateTo({
      path: "/queue/join/success",
      query: {
        name,
        ...(leadId && uuid ? { leadId, uuid } : {}),
      },
    });
  } catch (error) {
    ElNotification({
      title: "Ops!",
      message:
        "Não foi possível entrar na fila de doação. Por favor, verifique seus dados e tente novamente.",
      type: "error",
    });
  }
  buttonLoading.value = false;
}

function formatPhone(value: string) {
  const ddd = value.slice(0, 2);
  const phoneFirstPart = value.slice(2, 7)
  const phoneSecondPart = value.slice(7)

  if (ddd.length && !phoneFirstPart.length)
    return `(${ddd}) `
  if (phoneFirstPart.length && !phoneSecondPart.length)
    return `(${ddd}) ${phoneFirstPart}`
  if (phoneSecondPart.length)
    return `(${ddd}) ${phoneFirstPart}-${phoneSecondPart}`

  return value
}

function parsePhone(value: string) {
  return value.replace(/\D/g, '')
}
</script>

<template>
  <div class="page queue-join-page">
    <div class="event-header">
      <NuxtImg
        v-if="eventConfig?.logo"
        format="webp"
        :src="eventConfig?.logo"
        class="event-logo"
      />
      <h1>{{ eventConfig?.name ?? eventConfig?.slug ?? eventId }}</h1>
    </div>
    <el-form :model="form" class="form-wrapper">
      <el-form-item size="large" class="form-item">
        <el-input
          v-model="form.phone"
          type="tel"
          placeholder="Insira seu telefone com DDD"
          :prefix-icon="ElIconPhone"
          :disabled="disablePhone"
          maxlength="15"
          :formatter="(value: string) => formatPhone(value)"
          :parser="(value: string) => parsePhone(value)"
        />
      </el-form-item>
      <el-form-item size="large" class="form-item">
        <el-input
          v-model="form.name"
          :prefix-icon="ElIconUser"
          placeholder="Insira seu nome"
        />
      </el-form-item>
      <el-form-item size="large" class="form-item join-item">
        <el-button
          class="form-item"
          :disabled="!allowClick"
          type="success"
          :loading="buttonLoading"
          :icon="ElIconArrowRight"
          @click="onSubmit"
        >
          Entrar na fila de Doação!
        </el-button>
      </el-form-item>
    </el-form>
    <NuxtImg src="/images/logo-white.svg" class="logo" />
  </div>
</template>

<style scoped>
.queue-join-page {
  text-align: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  height: 100%;
}

.event-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.event-logo {
  height: 4rem;
  aspect-ratio: auto;
  border-radius: 25%;
}

h1 {
  margin: 0;
}

.form-item {
  width: 100%;
  margin-bottom: 0;
}

.form-wrapper {
  background-color: var(--hemo-color-secondary);
  padding: 1rem;
  border-radius: 1rem;
  width: 100%;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.join-item {
  margin-bottom: 0;
}

.logo {
  height: 4rem;
}

.plus-icon {
  width: 8%;
}

.offered-by {
  display: flex;
  gap: 1rem;
  width: 100%;
  align-items: center;
  justify-content: space-around;
}
</style>
