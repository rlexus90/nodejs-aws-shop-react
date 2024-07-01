import Products from "~/components/pages/PageProducts/components/Products";
import Box from "@mui/material/Box";

export default function PageProducts() {
  return (
    <Box py={3}>
      <p style={{ color: "red" }}>
        Now product not loading. It&apos;s will be available on next tack...
      </p>
      <Products />
    </Box>
  );
}
