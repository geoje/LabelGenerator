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
import {
  IconSun,
  IconMoonStars,
  IconFileSpreadsheet,
  IconPalette,
  IconDimensions,
} from "@tabler/icons";
import { MAX_NAV, next, prev, set } from "./stepSlice";

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
        <Grid.Col span={6} md={3} order={2} orderMd={1}>
          {step > 0 && <Button onClick={() => dispatch(prev())}>Back</Button>}
        </Grid.Col>
        <Grid.Col span={12} md={6} order={1} orderMd={2}>
          <Stepper
            active={step}
            onStepClick={(current) => dispatch(set(current))}
          >
            <Stepper.Step
              label="Set data"
              icon={<IconFileSpreadsheet size={18} />}
            />
            <Stepper.Step
              label="Design label"
              icon={<IconPalette size={18} />}
            />
            <Stepper.Step
              label="Set paper"
              icon={<IconDimensions size={18} />}
            />
          </Stepper>
        </Grid.Col>
        <Grid.Col span={6} md={3} order={3}>
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
            {step < MAX_NAV && (
              <Button onClick={() => dispatch(next())}>Next</Button>
            )}
          </Group>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
