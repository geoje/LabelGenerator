import { Button, Group, Text } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";
import { up, down } from "../counter/countSlice";

export default function Print() {
  const dispatch = useDispatch();
  const count = useSelector((state) => state.count.value);

  return (
    <Group>
      <Text>{count}</Text>
      <Button onClick={() => dispatch(up(2))}>Up</Button>
      <Button onClick={() => dispatch(down(2))}>Down</Button>
    </Group>
  );
}
