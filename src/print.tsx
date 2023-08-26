import { HeaderSimple } from "./components/header";
import { Grid } from "@mantine/core";
import { Control } from "./components/print/control";
import { Preview } from "./components/print/preview";

export default function Print() {
  return (
    <>
      <HeaderSimple />
      <Grid m={0} p="sm" pt="xl">
        <Grid.Col md={3} orderMd={1}>
          <Control />
        </Grid.Col>
        <Grid.Col md={9} orderMd={0}>
          <Preview />
        </Grid.Col>
      </Grid>
    </>
  );
}
