<template>
  <div v-if="loading" class="place-details__loading">
    <Loader />
  </div>

  <div v-else-if="error" class="place-details__error">
    Произошла ошибка при загрузке места: {{ error.message || error }}
  </div>

  <div v-else-if="place" class="place-details container">
    <button @click="goBack" class="back-button">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Назад
    </button>
    <header class="place-details__header">
      <h1 class="place-details__title">{{ place.name }}</h1>
      <div class="place-details__rating-wrapper">
        <svg class="star-icon" viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.32L22 9.27l-5 4.87 1.18 6.88L12 17.27l-6.18 3.23L7 14.14l-5-4.87l6.91-1.25L12 2z"
          />
        </svg>
        <span class="place-details__rating">
          {{
            place["average_rating"] === 0
              ? "Нет отзывов"
              : place["average_rating"]
          }}
        </span>
      </div>
    </header>
    <address class="place-details__address">{{ place.address }}</address>
    <div
      class="place-details__images"
      v-if="place.images && place.images.length"
    >
      <h3>Изображения:</h3>
      <ul class="images-list">
        <li
          class="images-item"
          v-for="(url, index) in place.images"
          :key="index"
        >
          <img :src="url" alt="Изображение места" height="250" loading="lazy" />
        </li>
      </ul>
    </div>
    <div
      v-if="place.category && place.category.length"
      class="place-details__categories"
    >
      <h3>Категории:</h3>
      <ul class="categories-list">
        <li
          v-for="category in place.category"
          :key="category"
          class="category-tag"
        >
          {{ placesStore.formatCategory(category) }}
        </li>
      </ul>
    </div>
    <div class="place-details__description">
      <h3>Описание:</h3>
      <p v-if="place.description">{{ place.description }}</p>
      <p v-else class="place-details__description-empty">
        Описание отсутствует.
      </p>
    </div>
    <Comments
      :id="id"
      :reviews="place.reviews"
      :fetchPlaceDetails="fetchPlaceDetails"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

import { useRouter } from "vue-router";
const router = useRouter();

import { usePlacesStore } from "../stores/placesStore";
const placesStore = usePlacesStore();

import Loader from "../components/Loader.vue";
import Comments from "../components/Comments.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const place = ref(null);
const loading = ref(true);
const error = ref(null);

async function fetchPlaceDetails(placeId) {
  loading.value = true;
  error.value = null;
  place.value = null;

  try {
    place.value = await placesStore.getPlaceById(placeId);
  } catch (err) {
    console.error("Ошибка загрузки места:", err);
    error.value = err;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchPlaceDetails(props.id);
});

watch(
  () => props.id,
  (newId) => {
    if (newId) {
      fetchPlaceDetails(newId);
    }
  },
);

const goBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.place-details {
  display: flex;
  flex-direction: column;
  padding: 25px;
  background-color: var(--color-background-card);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  &__error {
    text-align: center;
    margin-top: 50px;
    font-size: 20px;
    color: var(--color-red);
  }

  &__loading {
    justify-self: center;
    color: var(--color-primary);
    width: 200px;
  }

  &__header {
    display: flex;
  }

  &__title {
    font-size: clamp(32px, 4.8vw, 48px);
    color: var(--color-primary);
    overflow-wrap: anywhere;
    hyphens: auto;
  }

  &__rating-wrapper {
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: 8px;
    font-size: clamp(18px, 2.2vw, 22px);
    color: var(--color-text);
  }

  &__description p {
    font-size: clamp(14px, 1.6vw, 16px);
    color: var(--color-text);
    overflow-wrap: anywhere;
    hyphens: auto;

    &.place-details__description-empty {
      color: var(--color-static-gray);
    }
  }

  &__address {
    font-size: clamp(16px, 1.8vw, 18px);
    overflow-wrap: anywhere;
    hyphens: auto;
  }

  &__categories,
  &__description,
  &__images {
    h3 {
      font-size: clamp(18px, 2.2vw, 22px);
      color: var(--color-primary);
      margin-bottom: 10px;
    }
  }
}

.images {
  &-list {
    display: flex;
    column-gap: 20px;
    height: 250px;
    width: 100%;
    overflow-x: scroll;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
  }

  &-item {
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    max-width: 400px;
    height: 100%;
    scroll-snap-align: center;

    & img {
      object-fit: cover;
      object-position: center;
      height: 100%;
      width: auto;
    }
  }
}

.star-icon {
  width: 1.45em;
  height: 1.45em;
  fill: var(--color-star);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  max-width: 80px;
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 16px;
  padding: 5px;
  transition: color var(--transition-duration);
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
    transition: transform var(--transition-duration);
  }

  &:hover {
    color: var(--color-button-hover);

    svg {
      transform: translateX(-4px);
    }
  }
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-tag {
  background-color: var(--color-primary);
  color: var(--color-background-card);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: clamp(12px, 1.4vw, 14px);
  white-space: nowrap;
}

@media (max-width: 880px) {
  .images {
    &-list {
      height: 200px;
    }
  }
}

@media (max-width: 455px) {
  .place-details {
    &__header {
      flex-direction: column;
      margin-bottom: 10px;
    }

    &__rating-wrapper {
      margin-left: 0;
    }
  }

  .images {
    &-list {
      height: 160px;
      max-width: 370px;
    }
  }
}
</style>
