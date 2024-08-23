import {Box} from "@mui/material";
import useStore from "../hooks/useStore";

export type nightOrder = {
  id: string;
  order: number;
}

interface NightOrderIndicatorProps {
  nightOrder: nightOrder
}

function NightOrderIndicator({nightOrder}: NightOrderIndicatorProps) {

  const completedOrders = useStore(state => state.completedOrders);
  const addCompletedOrder = useStore(state => state.addCompletedOrder);
  const removeCompletedOrder = useStore(state => state.removeCompletedOrder);

  const checked = completedOrders.has(nightOrder.id);

  function handleClick(id: string) {
    if (completedOrders.has(id)) {
      removeCompletedOrder(id);
    } else {
      addCompletedOrder(id);
    }
  }

  return (
    <Box 
      sx={{
        background: checked ? "var(--sl-color-accent-low)" : "var(--sl-color-gray-3)",
        p: 0.1,
        borderRadius: 1,
        fontFamily: "monospace",
        fontWeight: 800,
        fontSize: "1rem",
        height: "1.4rem",
        aspectRatio: "1/1",
        userSelect: "none",
        textAlign: "center",
        ":hover": { cursor: "pointer"}
      }}
      onClick={() => {handleClick(nightOrder.id)}}
    >
      {String(nightOrder.order)}
    </Box>
  );
}

export default NightOrderIndicator
