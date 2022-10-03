import { useSelector, useDispatch } from "react-redux";
import { Stepper, Button, Grid, Group } from "@mantine/core";
import { next, prev, set } from "./stepSlice";

export default function Nav() {
  const dispatch = useDispatch();
  const step = useSelector((state) => state.step.value);

  return (
    <>
      <Grid
        m={0}
        p="xs"
        style={{ borderBottom: "1px solid rgb(233, 236, 239)" }}
      >
        <Grid.Col span={6} md={3} lg={4} order={2} orderMd={1}>
          <Button variant="default" onClick={() => dispatch(prev())}>
            Back
          </Button>
        </Grid.Col>
        <Grid.Col span={12} md={6} lg={4} order={1} orderMd={2}>
          <Stepper
            active={step}
            onStepClick={(current) => dispatch(set(current))}
            breakpoint="xs"
          >
            <Stepper.Step label="Set Data" description="Load and format" />
            <Stepper.Step
              label="Design Label"
              description="Place the elements"
            />
          </Stepper>
        </Grid.Col>
        <Grid.Col span={6} md={3} lg={4} order={3}>
          <Group position="right">
            <Button onClick={() => dispatch(next())}>Next</Button>
          </Group>
        </Grid.Col>
      </Grid>
    </>
  );
}
