<template>
  <h2 class="modal__title">Добавить новое место</h2>
  <form class="modal__form" novalidate @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="place-name" class="label required"> Название места </label>
      <input
        id="place-name"
        ref="placeNameInput"
        v-model.trim="newPlace.name"
        type="text"
        placeholder="Олимпийский парк"
        required
        class="modal__input input"
        :class="{ invalid: !isValid.name && isTouched.name }"
        aria-errormessage="place-name-error"
        @input="validateNameInput"
        @blur="markAsTouched('name')"
      />
      <span v-if="!isValid.name && isTouched.name" id="place-name-error" class="error-message">
        Название не может быть пустым и должно быть не менее 3 символов.
      </span>
    </div>
    <div class="form-group">
      <label for="place-address" class="label required"> Адрес </label>
      <input
        id="place-address"
        ref="addressInput"
        v-model.trim="newPlace.address"
        type="text"
        placeholder="Сириус, Олимпийский проспект, 1"
        required
        class="modal__input input"
        :class="{ invalid: !isValid.address && isTouched.address }"
        aria-errormessage="place-address-error"
        @input="validateAddressInput"
        @blur="markAsTouched('address')"
      />
      <span
        v-if="!isValid.address && isTouched.address"
        id="place-address-error"
        class="error-message"
      >
        Адрес не может быть пустым.
      </span>
    </div>
    <div class="form-group">
      <h3 class="label">Изображения (до 4 шт, макс 5МБ)</h3>
      <ImageUpload v-model="newPlace.images" />
    </div>
    <div class="form-group">
      <label for="place-categories" class="label required"> Категории </label>
      <select
        id="place-categories"
        ref="categoriesInput"
        v-model="newPlace.categories"
        multiple
        required
        class="modal__select-multiple input"
        :class="{ invalid: !isValid.categories && isTouched.categories }"
        aria-errormessage="place-categories-error"
        @change="validateCategoriesInput"
        @blur="markAsTouched('categories')"
      >
        <option disabled value="">Выберите одну или несколько</option>
        <option value="cafe">Кафе и рестораны</option>
        <option value="park">Парки и зоны отдыха</option>
        <option value="museum">Музеи и галереи</option>
        <option value="sport">Спортивные объекты</option>
        <option value="education">Образование</option>
        <option value="shop">Магазины</option>
        <option value="entertainment">Развлечения</option>
        <option value="hotel">Отели и проживание</option>
      </select>
      <span
        v-if="!isValid.categories && isTouched.categories"
        id="place-categories-error"
        class="error-message"
      >
        Выберите хотя бы одну категорию.
      </span>
    </div>
    <div class="form-group">
      <label for="place-description" class="label">Описание</label>
      <textarea
        id="place-description"
        v-model.trim="newPlace.description"
        rows="5"
        class="modal__textarea input"
        placeholder="Центральное место проведения зимних Олимпийских игр 2014 года."
      ></textarea>
    </div>
    <button class="modal__button" :aria-disabled="!isFormValid || isLoading">
      {{ isLoading ? "Загрузка..." : "Сохранить" }}
    </button>
    <span v-if="globalError" class="modal__global-error error-message">{{ globalError }}</span>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import axios from "axios";

import { usePlacesStore } from "../stores/placesStore";
import ImageUpload from "./ImageUpload.vue";

import type { TCategory } from "../types";

const emit = defineEmits(["close"]);

const placesStore = usePlacesStore();

const newPlace = ref({
  name: "",
  address: "",
  categories: [] as TCategory[],
  description: "",
  images: [] as Blob[],
});

const globalError = ref("");
const isValid = ref({ name: false, address: false, categories: false });
const isTouched = ref({ name: false, address: false, categories: false });

function markAsTouched(fieldName: keyof typeof isTouched.value) {
  isTouched.value[fieldName] = true;
}

const placeNameInput = ref<HTMLInputElement>();
const addressInput = ref<HTMLInputElement>();
const categoriesInput = ref<HTMLSelectElement>();

function validateNameInput() {
  isValid.value.name = newPlace.value.name.trim().length >= 3;
}
function validateAddressInput() {
  isValid.value.address = newPlace.value.address.trim().length > 0;
}
function validateCategoriesInput() {
  isValid.value.categories = newPlace.value.categories.length > 0;
}
const isFormValid = computed(
  () => isValid.value.name && isValid.value.address && isValid.value.categories
);

const isLoading = ref(false);
async function handleSubmit() {
  (Object.keys(isTouched.value) as Array<keyof typeof isTouched.value>).forEach(markAsTouched);
  validateNameInput();
  validateAddressInput();
  validateCategoriesInput();

  await nextTick();

  isLoading.value = true;
  if (isFormValid.value) {
    try {
      await placesStore.createPlace(
        newPlace.value.name,
        newPlace.value.address,
        newPlace.value.categories,
        newPlace.value.description,
        newPlace.value.images
      );
      await placesStore.getPlaces();
      emit("close");
    } catch (err) {
      globalError.value = "Что-то пошло не так :(";
      if (err instanceof axios.AxiosError) {
        if (err.response) {
          if (err.status === 403) {
            globalError.value = "Функция для добавления мест отключена";
          } else {
            globalError.value = `Произошла ошибка: ${err.status}`;
          }
        } else if (err.request) {
          globalError.value = "Ошибка, нет ответа от сервера, попробуйте еще раз";
        }
      }
      console.error("Ошибка при создании места:", err);
    }
  } else {
    const firstInvalid = [placeNameInput.value, addressInput.value, categoriesInput.value].find(
      (element) => element?.classList.contains("invalid")
    );
    firstInvalid?.focus();
  }
  isLoading.value = false;
}
</script>

<style lang="scss" scoped>
.modal__title {
  color: var(--color-primary);
  align-self: center;
}
.modal__form {
  display: flex;
  flex-direction: column;
  row-gap: 20px;
}
.modal__select-multiple {
  height: 118px;
  padding: 4px;
}
.modal__textarea {
  resize: vertical;
  min-height: 100px;
}
.modal__button {
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--color-primary);
  color: var(--color-background-card);
  padding: 6px 8px;
  transition: background-color var(--transition-duration);

  &:hover {
    background-color: var(--color-button-hover);
  }

  &:disabled,
  &[aria-disabled="true"] {
    background-color: var(--color-button-not-allowed);
    cursor: not-allowed;

    &:hover {
      background-color: var(--color-button-not-allowed-hover);
    }
  }
}
.input {
  outline: none;
  border: var(--border-primary);
  border-radius: var(--border-radius);
  padding: 8px 12px;

  &:focus {
    box-shadow: 0 0 3px 1px var(--color-primary);
  }
}
.invalid {
  border: var(--border-error);

  &:focus {
    box-shadow: 0 0 3px 1px var(--color-red);
  }
}
.form-group {
  display: flex;
  flex-direction: column;
}
.error-message {
  color: var(--color-red);
  font-size: 14px;
}

@media (max-width: 620px) {
  .input {
    padding: 4px 6px;
  }
  .modal__select-multiple {
    height: 80px;
  }
  .modal__textarea {
    height: 100px;
  }
}
</style>
