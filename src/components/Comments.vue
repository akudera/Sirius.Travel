<template>
  <section class="comments">
    <h3 class="comments__title">Оставить отзыв</h3>
    <form class="comments__form" novalidate @submit.prevent="submitComment">
      <div class="form-group">
        <label for="rating" class="visually-hidden">Укажите оценку (от 1 до 5)</label>
        <input
          id="rating"
          ref="ratingInput"
          v-model.number="newComment.rating"
          type="number"
          min="1"
          max="5"
          title="Оценка должна быть от 1 до 5."
          class="comments__form-input"
          :class="{ invalid: !isValid.rating && isTouched.rating }"
          @blur="markAsTouched('rating')"
          @input="validateRating"
        />
        <span v-if="!isValid.rating && isTouched.rating" class="error-message">
          Оценка должна быть от 1 до 5.
        </span>
      </div>
      <div class="form-group">
        <label for="review" class="visually-hidden">Введите отзыв</label>
        <textarea
          id="review"
          ref="descriptionInput"
          v-model.trim="newComment.description"
          placeholder="Напишите свой отзыв..."
          title="Отзыв должен содержать не менее 5 символов."
          class="comments__form-input comments__form-textarea"
          :class="{
            invalid: !isValid.description && isTouched.description,
          }"
          @blur="markAsTouched('description')"
          @input="validateDescription"
        ></textarea>
        <span v-if="!isValid.description && isTouched.description" class="error-message">
          Отзыв не может быть пустым и должен содержать не менее 5 символов.
        </span>
      </div>
      <button
        type="submit"
        class="comments__form-submit-button"
        :aria-disabled="!isFormValid || isSubmittingComment"
      >
        {{ isSubmittingComment ? "Отправка..." : "Отправить отзыв" }}
      </button>
      <p v-if="commentError" class="error-message comments__submit-error">
        {{ commentError }}
      </p>
    </form>

    <h3 class="comments__title">Отзывы ({{ reviews ? reviews.length : 0 }})</h3>
    <div v-if="reviews && reviews.length" class="comments__list">
      <div v-for="review in reviews" :key="review.id" class="comments__item">
        <div class="comments__rating">
          {{ review.rating }}
          <svg class="star-icon" viewBox="0 0 24 24">
            <path
              d="M12 2l3.09 6.32L22 9.27l-5 4.87 1.18 6.88L12 17.27l-6.18 3.23L7 14.14l-5-4.87l6.91-1.25L12 2z"
            />
          </svg>
        </div>
        <p class="comments__description">{{ review.description }}</p>
      </div>
    </div>
    <p v-else class="comments__empty">Пока нет отзывов. Будьте первым!</p>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";

import { usePlacesStore } from "../stores/placesStore";
import type { IReview } from "../interfaces";
import { AxiosError } from "axios";
const placesStore = usePlacesStore();

const props = defineProps<{
  id: string;
  reviews: IReview[];
  fetchPlaceDetails: (placeId: string) => Promise<void>;
}>();

const ratingInput = ref<HTMLInputElement | null>();
const descriptionInput = ref<HTMLInputElement | null>();

const isSubmittingComment = ref(false);
const commentError = ref("");

const newComment = ref({
  rating: 5,
  description: "",
});

const isTouched = ref({
  rating: false,
  description: false,
});

type TIsTouched = "rating" | "description";
function markAsTouched(fieldName: TIsTouched) {
  isTouched.value[fieldName] = true;
}

const isValid = ref({
  rating: true,
  description: false,
});

function validateRating(): void {
  isValid.value.rating = newComment.value.rating >= 1 && newComment.value.rating <= 5;
}

function validateDescription(): void {
  isValid.value.description = newComment.value.description.length >= 5;
}

const isFormValid = computed(() => isValid.value.rating && isValid.value.description);

async function submitComment() {
  Object.keys(isValid.value).forEach((field) => {
    markAsTouched(field as TIsTouched);
  });

  validateRating();
  validateDescription();

  if (isFormValid.value) {
    await nextTick();

    isSubmittingComment.value = true;
    try {
      await placesStore.addComment(props.id, newComment.value.rating, newComment.value.description);

      newComment.value.rating = 5;
      newComment.value.description = "";
      isTouched.value = {
        rating: false,
        description: false,
      };

      await props.fetchPlaceDetails(props.id);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.response) {
          if (err.status === 403) {
            commentError.value = "Функция для добавления комментариев отключена";
          } else {
            commentError.value += `${err.response?.data?.message || err.message || ""}`;
          }
        } else if (err.request) {
          commentError.value = "Ошибка, нет ответа от сервера, попробуйте еще раз";
        } else {
          commentError.value = "Что-то пошло не так :(";
        }
      } else {
        commentError.value = "Не удалось отправить отзыв. Попробуйте еще раз позже";
      }
      console.error("Ошибка при отправке комментария:", err);
    } finally {
      isSubmittingComment.value = false;
    }
  } else {
    const firstInvalid = [ratingInput.value, descriptionInput.value].find((element) =>
      element?.classList.contains("invalid")
    );
    firstInvalid?.focus();
  }
}
</script>

<style lang="scss" scoped>
.comments {
  margin-top: 40px;

  &__title {
    color: var(--color-primary);
    margin-block: 25px;
    font-size: clamp(18px, 2.2vw, 22px);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    background-color: var(--color-background-light);
    margin-bottom: 25px;

    .form-group {
      display: flex;
      flex-direction: column;
    }

    &-input,
    &-textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      font-size: clamp(14px, 1.6vw, 16px);
      color: var(--color-text);
      background-color: var(--color-background-card);
      box-sizing: border-box;
      transition:
        border-color var(--transition-duration),
        box-shadow var(--transition-duration);

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(24, 158, 160, 0.2);
      }

      &.invalid {
        border-color: var(--color-red) !important;
        box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.2) !important;
      }
    }

    &-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .error-message {
      color: var(--color-red);
      font-size: 14px;
      margin-top: 5px;
    }

    &-submit-error {
      text-align: center;
      font-weight: 500;
      margin-top: 10px;
    }

    &-submit-button {
      background-color: var(--color-primary);
      color: #ffffff;
      border: none;
      padding: 0.55em 1.1em;
      border-radius: var(--border-radius);
      cursor: pointer;
      font-size: clamp(16px, 1.8vw, 18px);
      transition: background-color var(--transition-duration);
      align-self: flex-end;

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
}

.comments {
  padding: 15px;

  &__description {
    font-size: clamp(14px, 1.6vw, 16px);
    color: var(--color-text);
    margin-bottom: 10px;
    overflow-wrap: anywhere;
    hyphens: auto;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    background-color: var(--color-background-light);
    border-radius: var(--border-radius);
    border: 1px dashed var(--color-border);
    row-gap: 5px;
    padding: 10px 15px;
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: clamp(14px, 1.6vw, 16px);
    color: var(--color-text);
    flex-basis: 100%;

    .star-icon {
      width: 1.1em;
      height: 1.1em;
      fill: var(--color-star);
    }
  }

  &__empty {
    font-size: clamp(14px, 1.6vw, 16px);
    text-align: center;
    color: #888;
    font-style: italic;
    margin-top: 15px;
  }
}

@media (max-width: 620px) {
  .comments {
    &__form-input {
      padding: 5px 8px;
    }

    &__form-submit-button {
      padding: 8px 15px;
    }
  }
}
</style>
