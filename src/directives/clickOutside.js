const handlersMap = new WeakMap();

export default {
  beforeMount(element, binding) {
    const { fn, ignore = [] } = binding.value;

    const handlerClick = function (event) {
      if (
        !element.contains(event.target) &&
        !ignore.some((ignoreEl) => ignoreEl?.contains(event.target))
      ) {
        fn(event);
      }
    };
    handlersMap.set(element, handlerClick);

    document.addEventListener("click", handlerClick);
  },

  unmounted(element) {
    const handlerClick = handlersMap.get(element);

    if (handlerClick) {
      document.removeEventListener("click", handlerClick);
      handlersMap.delete(element);
    }
  },
};
