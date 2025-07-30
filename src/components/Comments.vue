<template>
  <section class="comments">
    <h3 class="comments__title">Оставить отзыв</h3>
    <form @submit.prevent="submitComment" class="comments__form" novalidate>
      <div class="form-group">
        <label for="rating" class="visually-hidden"
          >Укажите оценку (от 1 до 5)</label
        >
        <input
          type="number"
          id="rating"
          ref="ratingInput"
          min="1"
          max="5"
          title="Оценка должна быть от 1 до 5."
          v-model.number="newComment.rating"
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
          placeholder="Напишите свой отзыв..."
          title="Отзыв должен содержать не менее 5 символов."
          v-model.trim="newComment.description"
          class="comments__form-input comments__form-textarea"
          :class="{
            invalid: !isValid.description && isTouched.description,
          }"
          @blur="markAsTouched('description')"
          @input="validateDescription"
        ></textarea>
        <span
          v-if="!isValid.description && isTouched.description"
          class="error-message"
        >
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
    <div class="comments__list" v-if="reviews && reviews.length">
      <div class="comments__item" v-for="review in reviews" :key="review.id">
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

<script setup>
import { ref, computed, nextTick } from "vue";

import { usePlacesStore } from "../stores/placesStore";
const placesStore = usePlacesStore();

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  reviews: {
    type: Object,
    required: true,
  },
  fetchPlaceDetails: Function,
});

const ratingInput = ref();
const descriptionInput = ref();

const isSubmittingComment = ref(false);
const commentError = ref(null);

const newComment = ref({
  rating: 5,
  commentText: "",
});

const isTouched = ref({
  rating: false,
  description: false,
});

function markAsTouched(fieldName) {
  isTouched.value[fieldName] = true;
}

const isValid = ref({
  rating: true,
  description: false,
});

function validateRating() {
  isValid.value.rating =
    newComment.value.rating >= 1 && newComment.value.rating <= 5;
}

function validateDescription() {
  isValid.value.description = newComment.value.description?.length >= 5;
}

const isFormValid = computed(() => {
  return isValid.value.rating && isValid.value.description;
});

function submitComment() {
  markAsTouched("rating");
  markAsTouched("description");

  validateRating();
  validateDescription();

  if (isFormValid.value) {
    nextTick(async () => {
      isSubmittingComment.value = true;
      try {
        await placesStore.addComment(
          props.id,
          newComment.value.rating,
          newComment.value.description,
        );

        newComment.value.rating = 5;
        newComment.value.description = "";
        isTouched.value = {
          rating: false,
          description: false,
        };

        await props.fetchPlaceDetails(props.id);
      } catch (err) {
        console.error("Ошибка при отправке комментария:", err);
        commentError.value =
          "Не удалось отправить отзыв. Попробуйте еще раз. " +
          (err.response?.data?.message || err.message || "");
      } finally {
        isSubmittingComment.value = false;
      }
    });
  } else {
    nextTick(() => {
      [ratingInput.value, descriptionInput.value].some((element) => {
        if (element.classList.contains("invalid")) {
          element.focus();
          return true;
        }
      });
    });
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
