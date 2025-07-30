<template>
  <Teleport to="body">
    <dialog
      ref="modalElement"
      class="modal"
      @keydown.prevent.escape="closeModal"
    >
      <div
        class="modal-inner"
        v-click-outside="{ fn: closeModal, ignore: [openButton] }"
      >
        <button
          type="button"
          class="modal__close-button"
          aria-label="Закрыть меню"
          title="Закрыть меню"
          @click="closeModal"
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
        <h2 class="modal__title">Добавить новое место</h2>
        <form class="modal__form" novalidate @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="place-name" class="label required">
              Название места
            </label>
            <input
              type="text"
              id="place-name"
              ref="placeNameInput"
              v-model.trim="newPlace.name"
              @input="validateNameInput"
              @blur="markAsTouched('name')"
              placeholder="Олимпийский парк"
              required
              class="modal__input input"
              :class="{ invalid: !isValid.name && isTouched.name }"
              aria-errormessage="place-name-error"
            />
            <span
              v-if="!isValid.name && isTouched.name"
              class="error-message"
              id="place-name-error"
            >
              Название не может быть пустым и должно быть не менее 3 символов.
            </span>
          </div>
          <div class="form-group">
            <label for="place-address" class="label required"> Адрес </label>
            <input
              type="text"
              id="place-address"
              ref="addressInput"
              v-model.trim="newPlace.address"
              @input="validateAddressInput"
              @blur="markAsTouched('address')"
              placeholder="Сириус, Олимпийский проспект, 1"
              required
              class="modal__input input"
              :class="{ invalid: !isValid.address && isTouched.address }"
              aria-errormessage="place-address-error"
            />
            <span
              v-if="!isValid.address && isTouched.address"
              class="error-message"
              id="place-address-error"
            >
              Адрес не может быть пустым.
            </span>
          </div>
          <div class="form-group">
            <h3 class="label">Изображения (до 4 шт, макс 5МБ)</h3>
            <ImageUpload v-model="newPlace.images" />
          </div>
          <div class="form-group">
            <label for="place-categories" class="label required">
              Категории
            </label>
            <select
              id="place-categories"
              ref="categoriesInput"
              v-model="newPlace.categories"
              @change="validateCategoriesInput"
              @blur="markAsTouched('categories')"
              multiple
              required
              class="modal__select-multiple input"
              :class="{ invalid: !isValid.categories && isTouched.categories }"
              aria-errormessage="place-categories-error"
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
              class="error-message"
              id="place-categories-error"
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
          <button class="modal__button" :aria-disabled="!isFormValid">
            Сохранить
          </button>
        </form>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup>
import { Teleport, ref, computed, watch, nextTick } from "vue";

import { useModalStore } from "../stores/modalStore";
const modalStore = useModalStore();

import { usePlacesStore } from "../stores/placesStore";
const placesStore = usePlacesStore();

import ImageUpload from "./ImageUpload.vue";

defineProps({
  openButton: HTMLElement,
});

const modalElement = ref();
watch(
  () => modalStore.isOpen,
  (newIsOpen) => {
    if (newIsOpen) {
      modalElement.value.showModal();
    } else {
      modalElement.value.close();
    }
  },
);

const newPlace = ref({
  name: "",
  address: "",
  categories: [],
  description: "",
  images: [],
});

const isValid = ref({
  name: false,
  address: false,
  categories: false,
});

const isTouched = ref({
  name: false,
  address: false,
  categories: false,
});

function markAsTouched(fieldName) {
  isTouched.value[fieldName] = true;
}

const placeNameInput = ref();
const addressInput = ref();
const categoriesInput = ref();

function validateNameInput() {
  isValid.value.name = newPlace.value.name.trim().length >= 3;
}

function validateAddressInput() {
  isValid.value.address = newPlace.value.address.trim().length > 0;
}

function validateCategoriesInput() {
  isValid.value.categories = newPlace.value.categories.length > 0;
}

const isFormValid = computed(() => {
  return (
    isValid.value.name && isValid.value.address && isValid.value.categories
  );
});

function closeModal() {
  resetModal();
  modalStore.closeMenu();
}

function resetModal() {
  isValid.value = {
    name: false,
    address: false,
    categories: false,
  };
  newPlace.value = {
    name: "",
    address: "",
    categories: [],
    description: "",
    images: [],
  };
  isTouched.value = {
    name: false,
    address: false,
    categories: false,
  };
}

function handleSubmit() {
  markAsTouched("name");
  markAsTouched("address");
  markAsTouched("categories");

  validateNameInput();
  validateAddressInput();
  validateCategoriesInput();

  nextTick(async () => {
    if (isFormValid.value) {
      try {
        await placesStore.createPlace(
          newPlace.value.name,
          newPlace.value.address,
          newPlace.value.categories,
          newPlace.value.description,
          newPlace.value.images,
        );
        await placesStore.getPlaces();
        closeModal();
      } catch (err) {
        console.error(err);
      }
    } else {
      [placeNameInput.value, addressInput.value, categoriesInput.value].some(
        (element) => {
          if (element.classList.contains("invalid")) {
            element.focus();
            return true;
          }
        },
      );
    }
  });
}
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

  &__form {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
  }

  &__title {
    color: var(--color-primary);
    align-self: center;
  }

  &__select-multiple {
    height: 118px;
    padding: 4px;
  }

  &__textarea {
    resize: vertical;
    min-height: 100px;
  }

  &__button {
    border: none;
    border-radius: var(--border-radius);
    background-color: var(--color-primary);
    color: var(--color-background-card);
    padding: 6px 8px;
    transition: background-color var(--transition-duration);

    &:hover {
      background-color: var(--color-button-hover);
    }

    &[aria-disabled="true"] {
      background-color: var(--color-button-not-allowed);
      cursor: not-allowed;

      &:hover {
        background-color: var(--color-button-not-allowed-hover);
      }
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
  .modal-inner {
    font-size: 14px;
  }

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
