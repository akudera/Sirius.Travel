<template>
  <Teleport to="body">
    <dialog ref="modalElement" class="modal" @keydown.escape="closeModal">
      <div
        v-click-outside="{ fn: closeModal, ignore: [openButton] }"
        class="modal-inner"
      >
        <button
          type="button"
          class="modal__close-button"
          aria-label="Закрыть меню"
          title="Закрыть меню"
          @click="emit('close')"
        >
          <svg
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M26 2L2 26M2 2L26 26"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <slot></slot>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  openButton?: HTMLElement;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();

function closeModal() {
  emit("close");
}

const modalElement = ref<HTMLDialogElement | null>();
watch(
  () => props.isOpen,
  (newIsOpen) => {
    if (!modalElement.value) return;
    if (newIsOpen) {
      document.documentElement.classList.add("is-locked");
      modalElement.value.showModal();
    } else {
      document.documentElement.classList.remove("is-locked");
      modalElement.value.close();
    }
  },
);
</script>

<style lang="scss" scoped>
.modal {
  max-width: 750px;
  width: 85%;
  border: var(--border-primary);
  border-radius: var(--border-radius);
  padding: 0;
  background-color: var(--color-background-card);

  &::backdrop {
    background-color: #000000;
    opacity: 0.5;
  }

  &-inner {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    padding: 25px;
    padding-bottom: 80px;
  }

  &__close-button {
    position: absolute;
    top: 5px;
    right: 5px;
    width: calc(20px + 0.3em * 2);
    background-color: transparent;
    border: none;
    padding-inline: 0.3em;
    font-size: 28px;
    color: var(--color-text);
    transition: color var(--transition-duration);

    &:hover {
      color: var(--color-button-hover);
    }
  }
}

@media (max-width: 620px) {
  .modal-inner {
    font-size: 14px;
  }
}
</style>
