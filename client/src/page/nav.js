import { useState } from "react";
import { Stepper, Button, Grid, Group } from "@mantine/core";

import "./nav.css";

function Nav() {
  const [active, setActive] = useState(1);
  const nextStep = () =>
    setActive((current) => (current < 2 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <>
      <Grid
        m={0}
        p="xs"
        style={{ borderBottom: "1px solid rgb(233, 236, 239)" }}
      >
        <Grid.Col span={6} md={3} lg={4} order={2} orderMd={1}>
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        </Grid.Col>
        <Grid.Col span={12} md={6} lg={4} order={1} orderMd={2}>
          <Stepper active={active} onStepClick={setActive} breakpoint="xs">
            <Stepper.Step
              label="QR Code Format"
              description="Format text in QR"
            />
            <Stepper.Step label="Label Design" description="Position element" />
            <Stepper.Completed>
              Completed, click back button to get to previous step
            </Stepper.Completed>
          </Stepper>
        </Grid.Col>
        <Grid.Col span={6} md={3} lg={4} order={3}>
          <Group position="right">
            <Button position="right" onClick={nextStep}>
              Next step
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </>
  );
}

export default Nav;
