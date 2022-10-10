import { useSelector, useDispatch } from "react-redux";
import {
  Stepper,
  Button,
  Grid,
  Group,
  ActionIcon,
  useMantineColorScheme,
  Paper,
} from "@mantine/core";
import { IconSun, IconMoonStars } from "@tabler/icons";
import { next, prev, set } from "./stepSlice";

export default function Nav() {
  // Provider
  const dispatch = useDispatch();
  const step = useSelector((state) => state.step.value);

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Paper
      sx={() => ({
        borderRadius: 0,
      })}
    >
      <Grid
        sx={(theme) => ({
          borderBottom: `1px solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[4]
              : theme.colors.gray[2]
          }`,
        })}
        m={0}
        p="xs"
      >
        <Grid.Col span={6} md={3} lg={4} order={2} orderMd={1}>
          {step > 0 && <Button onClick={() => dispatch(prev())}>Back</Button>}
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
            <ActionIcon
              variant="outline"
              color={dark ? "yellow" : "blue"}
              onClick={() => toggleColorScheme()}
              title="Toggle color scheme"
              size="lg"
            >
              {dark ? <IconSun size={18} /> : <IconMoonStars size={18} />}
            </ActionIcon>
            {step < 2 && <Button onClick={() => dispatch(next())}>Next</Button>}
          </Group>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
