<template>
  <header class="header container">
    <h1 class="header__title">Сириус.Путеводитель</h1>
    <button
      class="header__add-button"
      ref="addPlaceButton"
      @click="modalStore.openMenu()"
    >
      Добавить новое место
    </button>
    <Modal :open-button="addPlaceButton" v-if="addPlaceButton" />
    <hr />
  </header>

  <div class="filters container">
    <div class="filters__filter-group">
      <label for="category" class="label">Фильтр по категории:</label>
      <select id="category" class="filters__select" v-model="category">
        <option value="">Все категории</option>
        <option value="cafe">Кафе и рестораны</option>
        <option value="park">Парки и зоны отдыха</option>
        <option value="museum">Музеи и галереи</option>
        <option value="sport">Спортивные объекты</option>
        <option value="education">Образование</option>
        <option value="shop">Магазины</option>
        <option value="entertainment">Развлечения</option>
        <option value="hotel">Отели и проживание</option>
      </select>
    </div>

    <div class="filters__filter-group">
      <label for="rating" class="label">Фильтр по оценке:</label>
      <select id="rating" class="filters__select" v-model="rating">
        <option value="">Нет</option>
        <option value="fromMore">От большей к меньшей</option>
        <option value="fromLess">От меньшей к большей</option>
      </select>
    </div>
  </div>

  <main class="main container">
    <div class="main__loader" v-if="isLoading">
      <Loader />
    </div>
    <template v-else>
      <div v-if="error" class="error">
        {{ `Не удалось загрузить: ${error.message}` }}
      </div>
      <RouterLink
        class="place-card"
        v-for="place in placesStore.places"
        :key="place.id"
        :to="{ name: 'PlaceDetails', params: { id: place.id } }"
      >
        <h2 class="place-card__title">{{ place.name }}</h2>
        <address class="place-card__address">
          {{ place.address }}
        </address>
        <div class="place-card__rating-wrapper">
          <svg class="star-icon" viewBox="0 0 24 24">
            <path
              d="M12 2l3.09 6.32L22 9.27l-5 4.87 1.18 6.88L12 17.27l-6.18 3.23L7 14.14l-5-4.87l6.91-1.25L12 2z"
            />
          </svg>
          <span class="place-card__rating">{{
            place["average_rating"] === 0
              ? "Нет отзывов"
              : place["average_rating"]
          }}</span>
        </div>
      </RouterLink>
    </template>
  </main>
</template>

<script setup>
import { ref, watchEffect } from "vue";

import { usePlacesStore } from "../stores/placesStore";
const placesStore = usePlacesStore();

import { useModalStore } from "../stores/modalStore";
const modalStore = useModalStore();

import Loader from "../components/Loader.vue";
import Modal from "../components/Modal.vue";

const addPlaceButton = ref();

const category = ref("");
const rating = ref("");

const error = ref("");
const isLoading = ref(false);

watchEffect(async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const params = new URLSearchParams();
    if (category.value) {
      params.append("category", category.value);
    }
    if (rating.value) {
      params.append("sort_by_rating", rating.value);
    }

    console.log(params.toString());
    await placesStore.getPlaces(params.toString());
  } catch (err) {
    error.value = err;
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.header {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: 8px;
  align-items: center;
  padding-bottom: 15px;

  &__title {
    color: var(--color-primary);
    font-size: clamp(28px, 3.91vw, 36px);
  }

  &__add-button {
    max-width: 210px;
    background-color: var(--color-primary);
    color: #ffffff;
    border: none;
    padding: 0.63em 1.25em;
    margin-left: auto;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: clamp(14px, 1.74vw, 16px);
    transition: background-color var(--transition-duration);

    &:hover {
      background-color: var(--color-button-hover);
    }
  }

  & hr {
    grid-column: span 2;
    align-self: flex-end;
    margin-top: 30px;
    width: 100%;
    background-color: var(--color-border);
  }
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;

  &__filter-group {
    display: flex;
    flex-direction: column;
    min-width: 200px;
  }

  &__select {
    padding: 8px 10px;
    border: var(--border);
    border-radius: 5px;
    font-size: 16px;
    color: var(--color-text);
    appearance: none;
    background: url('data:image/svg+xml;utf8,<svg fill="currentColor" height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')
      no-repeat var(--color-background-card);
    background-position: right 8px center;
    background-size: 18px;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px #189ea033;
    }
  }
}

.main {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;

  &__loader {
    display: flex;
    justify-content: center;
    grid-column: 2 span;
    width: 100%;
    color: var(--color-button-hover);

    & svg {
      height: 200px;
    }
  }
}

.place-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-background-card);
  border-radius: 12px;
  box-shadow: 0 4px 10px var(--color-shadow);
  padding: 20px;
  cursor: pointer;
  transition:
    transform var(--transition-duration-long),
    box-shadow var(--transition-duration);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px #00000026;
  }

  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-primary);
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 24px;
  }

  &__rating-wrapper {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__rating {
    color: var(--color-text);
    font-weight: bold;
    font-size: 18px;
  }

  &__address {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-text);
    font-size: 14px;
    margin-bottom: 15px;
  }
}

.error {
  color: var(--color-red);
}

.star-icon {
  width: 20px;
  height: 20px;
  fill: var(--color-star);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .header hr {
    margin-top: 15px;
  }

  .filters {
    flex-direction: column;
  }
}

@media (max-width: 540px) {
  .header {
    grid-template-columns: 1fr;

    &__add-button {
      margin-left: 0;
    }

    & hr {
      grid-column: 1;
    }
  }
}
</style>
