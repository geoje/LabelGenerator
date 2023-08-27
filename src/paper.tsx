import { Grid } from "@mantine/core";
import { Size } from "./components/paper/size";
import { Adjust } from "./components/paper/adjust";

export default function Paper() {
  return (
    <Grid m={0} p="sm" pt="lg">
      <Grid.Col md={2}>
        <Size />
      </Grid.Col>
      <Grid.Col md={10}>
        <Adjust />
      </Grid.Col>
    </Grid>
  );
}
