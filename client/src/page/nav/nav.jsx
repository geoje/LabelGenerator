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
  IconRuler3,
  IconFolder,
  IconDeviceFloppy,
} from "@tabler/icons";
import { MAX_NAV, next, prev, set } from "./stepSlice";

const ICON_SIZE = 18;

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
          <Group>
            {step > 0 && <Button onClick={() => dispatch(prev())}>Back</Button>}

            <ActionIcon
              variant="outline"
              color={"blue"}
              onClick={() => {}}
              title="Load project"
              size="lg"
            >
              <IconFolder size={ICON_SIZE} />
            </ActionIcon>
            <ActionIcon
              variant="outline"
              color={"blue"}
              onClick={() => {}}
              title="Save project"
              size="lg"
            >
              <IconDeviceFloppy size={ICON_SIZE} />
            </ActionIcon>
          </Group>
        </Grid.Col>
        <Grid.Col span={12} md={6} order={1} orderMd={2}>
          <Stepper
            active={step}
            onStepClick={(current) => dispatch(set(current))}
          >
            <Stepper.Step
              label="Set data"
              icon={<IconFileSpreadsheet size={ICON_SIZE} />}
            />
            <Stepper.Step
              label="Design label"
              icon={<IconPalette size={ICON_SIZE} />}
            />
            <Stepper.Step
              label="Set paper"
              description="developing"
              icon={<IconRuler3 size={ICON_SIZE} />}
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
              {dark ? (
                <IconSun size={ICON_SIZE} />
              ) : (
                <IconMoonStars size={ICON_SIZE} />
              )}
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
