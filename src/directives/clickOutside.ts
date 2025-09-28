import type { DirectiveBinding, ObjectDirective } from "vue";

interface ClickOutsideBinding {
  fn: (event: MouseEvent) => void;
  ignore?: (Element | null)[];
}

const handlersMap = new WeakMap<HTMLElement, (event: MouseEvent) => void>();

const clickOutsideDirective: ObjectDirective<HTMLElement, ClickOutsideBinding> =
  {
    beforeMount(element, binding: DirectiveBinding<ClickOutsideBinding>) {
      const { fn, ignore = [] } = binding.value;

      const handlerClick = function (event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (
          target instanceof Element &&
          !element.contains(target) &&
          !ignore.some((ignoreEl) => ignoreEl?.contains(target))
        ) {
          fn(event);
        }
      };
      handlersMap.set(element, handlerClick);

      document.addEventListener("click", handlerClick);
    },

    unmounted(element: HTMLElement) {
      const handlerClick = handlersMap.get(element);

      if (handlerClick) {
        document.removeEventListener("click", handlerClick);
        handlersMap.delete(element);
      }
    },
  };

export default clickOutsideDirective;
