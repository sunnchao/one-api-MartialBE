import {
  NLayout,
  NLayoutHeader,
  NLayoutFooter,
  NLayoutContent,
} from "naive-ui";
import { defineComponent } from "vue";

const RootLayout = defineComponent((props, ctx) => {
  return () => (
    <NLayout>
      <NLayoutHeader>Header</NLayoutHeader>
      <NLayoutContent>
        {{
          default: () => ctx?.slots?.default?.() ?? null,
        }}
      </NLayoutContent>
      <NLayoutFooter>Footer</NLayoutFooter>
    </NLayout>
  );
});

export default RootLayout;
