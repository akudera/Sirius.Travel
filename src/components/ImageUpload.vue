<template>
  <div class="image-upload">
    <div class="image-upload__list-wrapper">
      <ul v-if="imageUrls.length > 0" class="image-upload__preview-list">
        <li
          v-for="(url, index) in imageUrls"
          :key="index"
          class="image-upload__preview-item"
        >
          <img
            :src="url"
            alt="Предпросмотр изображения"
            class="image-upload__preview-image"
          />
          <button
            type="button"
            class="image-upload__delete-button"
            title="Удалить изображение"
            aria-label="Удалить изображение"
            @click.stop="removeImage(index)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </li>
      </ul>
      <div v-if="canAddMoreFiles" class="image-upload__add-button-wrapper">
        <label for="file-input" class="image-upload__add-button">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>Добавить</span>
        </label>
      </div>
    </div>
    <input
      id="file-input"
      ref="fileInput"
      type="file"
      class="image-upload__input"
      accept="image/*"
      multiple
      @change="handleFileChange"
    />
    <span v-if="errorMessage" class="image-upload__error error-message">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  modelValue: {
    type: Array as PropType<Blob[]>,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const MAX_FILES = 4;
const MAX_TOTAL_SIZE_MB = 5;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

const fileInput = ref<HTMLInputElement | null>();
type URLStrings = string[];
const imageUrls = ref<URLStrings>([]);
const errorMessage = ref("");

const canAddMoreFiles = computed(() => props.modelValue.length < MAX_FILES);

function handleFileChange(event: Event): void {
  if (!fileInput.value) return;
  errorMessage.value = "";
  const selectedFiles = Array.from(
    (event.target as HTMLInputElement)?.files || [],
  );
  const currentFiles = props.modelValue;

  if (currentFiles.length + selectedFiles.length > MAX_FILES) {
    errorMessage.value = `Можно загрузить не более ${MAX_FILES} изображений.`;

    fileInput.value.value = "";
    return;
  }

  const currentTotalSize = currentFiles.reduce(
    (total, file) => total + file.size,
    0,
  );
  const newFilesSize = selectedFiles.reduce(
    (total, file) => total + file.size,
    0,
  );

  if (currentTotalSize + newFilesSize > MAX_TOTAL_SIZE_BYTES) {
    errorMessage.value = `Общий размер файлов не должен превышать ${MAX_TOTAL_SIZE_MB} МБ.`;
    fileInput.value.value = "";
    return;
  }

  emit("update:modelValue", [...currentFiles, ...selectedFiles]);
  fileInput.value.value = "";
}

function removeImage(index: number): void {
  const updatedFiles = [...props.modelValue];
  updatedFiles.splice(index, 1);
  emit("update:modelValue", updatedFiles);
  errorMessage.value = "";
}

watch(
  () => props.modelValue,
  (newFiles) => {
    imageUrls.value.forEach((url) => URL.revokeObjectURL(url));
    imageUrls.value = newFiles.map((file) => URL.createObjectURL(file));
  },
);

onUnmounted(() => {
  imageUrls.value.forEach((url) => URL.revokeObjectURL(url));
});
</script>

<style lang="scss" scoped>
.image-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__input {
    display: none;
  }

  &__list-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  &__preview-list {
    display: contents;
    padding: 0;
    margin: 0;
  }

  &__preview-item,
  &__add-button-wrapper {
    width: 100px;
    height: 100px;
  }

  &__preview-item {
    position: relative;
    border-radius: var(--border-radius);
    overflow: hidden;
    border: 1px solid var(--color-border);
  }

  &__preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__delete-button {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color var(--transition-duration);

    &:hover {
      background-color: rgba(241, 27, 27, 0.8);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__add-button {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 2px dashed var(--color-primary);
    border-radius: var(--border-radius);
    color: var(--color-primary);
    cursor: pointer;
    transition:
      background-color var(--transition-duration),
      color var(--transition-duration);
    font-size: 14px;

    svg {
      width: 28px;
      height: 28px;
    }

    &:hover {
      background-color: var(--color-primary);
      color: var(--color-background-card);
    }
  }

  &__error {
    color: var(--color-red);
    font-size: 14px;
  }
}

@media (max-width: 450px) {
  .image-upload__list-wrapper {
    justify-content: center;
  }
}
</style>
