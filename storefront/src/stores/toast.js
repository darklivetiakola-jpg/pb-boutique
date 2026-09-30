import { defineStore } from "pinia";

let timer = null;

export const useToastStore = defineStore("toast", {
  state: () => ({ message: "", visible: false }),
  actions: {
    show(message) {
      this.message = message;
      this.visible = true;
      clearTimeout(timer);
      timer = setTimeout(() => { this.visible = false; }, 3000);
    },
  },
});
