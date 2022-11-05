import { Grid, Group, Text } from "@mantine/core";
import { useSelector } from "react-redux";
import { Canvas } from "../design/design";

function Preview(props) {
  return (
    <Group position="center" key={`canvas-${props.index}`}>
      <Text>{props.index}</Text>
      <Canvas index={props.index} />
    </Group>
  );
}

function Control() {
  return <></>;
}

export default function Print() {
  const data = useSelector((state) => state.data.value);

  const previews = [];
  previews.push(<Preview index={0} />);
  previews.push(<Preview index={77} />);

  return (
    <Grid>
      <Grid.Col md={8}>{previews}</Grid.Col>
      <Grid.Col md={4}>
        <Control />
      </Grid.Col>
    </Grid>
  );
}
