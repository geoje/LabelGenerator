import {
  createStyles,
  Header,
  Container,
  Group,
  Burger,
  Image,
  MantineTheme,
  ActionIcon,
  useMantineTheme,
  Breadcrumbs,
  Text,
  FileButton,
  Box,
  NavLink,
  Popover,
  Grid,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconFile,
  IconFolder,
  IconDeviceFloppy,
  IconChevronRight,
  IconBrush,
  IconPrinter,
  IconFileSpreadsheet,
  IconGridDots,
  IconSun,
  IconMoonStars,
} from "@tabler/icons-react";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import { LoadFile, SaveFile } from "../lib/tool";

const links: { link: string; label: string; icon: React.ReactNode }[] = [
  {
    link: "/",
    label: "Data",
    icon: <IconFileSpreadsheet />,
  },
  {
    link: "/draw",
    label: "Draw",
    icon: <IconBrush />,
  },
  {
    link: "/paper",
    label: "Paper",
    icon: <IconFile />,
  },
  {
    link: "/print",
    label: "Print",
    icon: <IconPrinter />,
  },
];
const useStyles = createStyles((theme: MantineTheme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    position: "relative",
    maxWidth: theme.breakpoints.xl,
    height: "64px",
    gap: "16px",

    [theme.fn.smallerThan("xs")]: {
      padding: 0,
    },
  },

  links: {
    height: "100%",
    flexWrap: "nowrap",
  },

  noneSmallerThanXS: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  noneLargerThanXS: {
    [theme.fn.largerThan("xs")]: {
      display: "none",
    },
  },

  link: {
    display: "flex",
    lineHeight: 1,
    width: "auto",
    height: "100%",
    padding: "8px 4px",
    borderRadius: theme.radius.sm,
    transition: "color 0.1s",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[6],
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,

    "&:hover": {
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[9],
    },
  },
  linkActive: {
    "&, &:hover": {
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },

  linkLogo: {
    padding: 0,
    [theme.fn.smallerThan("xs")]: {
      position: "absolute",
      left: "calc(50% - 32px)",
    },
  },
  linkAuth: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,
    transition: "background-color 0.1s",
  },

  menu: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

    width: "100%",
    height: "80px",
  },
  mewnuTitle: {
    marginTop: 4,
    fontSize: "10px",
    textAlign: "center",
  },
}));

export function HeaderSimple() {
  const dispatch = useDispatch();

  // For load and save file
  const data = useSelector((state: any) => state.data.value);
  const layer = useSelector((state: any) => state.draw.layer);
  const fontMap = useSelector((state: any) => state.draw.fontMap);
  const drawLayout = useSelector((state: any) => state.draw.layout);
  const paperLayout = useSelector((state: any) => state.paper.layout);
  const condition = useSelector((state: any) => state.print.condition);
  const exclude = useSelector((state: any) => state.print.exclude);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { classes, cx } = useStyles();
  const dark = colorScheme === "dark";

  const [opened, { close, toggle }] = useDisclosure(false);

  return (
    <Header
      height={opened ? "auto" : 64}
      style={{
        position: "sticky",
        background: "transparent",
        border: 0,
        boxShadow: `0 1px 3px 0 rgb(0 0 0/0.${
          dark ? "4" : "1"
        }),0 1px 2px -1px rgb(0 0 0/0.${dark ? "4" : "1"})`,
        transition: "0.1s",
      }}
      zIndex={1}
    >
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "64px",
          background: dark ? theme.colors.dark[7] : theme.white,
        }}
      ></div>
      <Container className={classes.header}>
        <Burger
          opened={opened}
          onClick={toggle}
          className={classes.noneLargerThanXS}
          size="sm"
          p={24}
        />

        <Link to="/" className={cx(classes.link, classes.linkLogo)}>
          <ActionIcon size={64} variant="transparent">
            <Image src="/logo.svg" width={32} alt="home" />
          </ActionIcon>
        </Link>
        <Group
          className={cx(classes.links, classes.noneSmallerThanXS)}
          mr="auto"
        >
          <Breadcrumbs
            separator={
              <Text sx={(theme) => ({ color: theme.colors.gray[4] })}>
                <IconChevronRight />
              </Text>
            }
            styles={{ separator: { margin: 0 } }}
          >
            {links.map(({ link, label }) => (
              <Link to={link} key={label}>
                <ActionIcon
                  variant="transparent"
                  className={cx(classes.link, {
                    [classes.linkActive]:
                      link === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link),
                  })}
                >
                  <FormattedMessage id={label} />{" "}
                </ActionIcon>
              </Link>
            ))}
          </Breadcrumbs>
        </Group>

        <Group spacing="xs" pr="md" className={classes.links}>
          <Popover position="bottom" withArrow shadow="md" width={300}>
            <Popover.Target>
              <ActionIcon size="lg" color="gray" variant="subtle">
                <IconGridDots />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Grid gutter="xs">
                <Grid.Col span={4}>
                  <ActionIcon
                    color="gray"
                    variant="subtle"
                    className={classes.menu}
                    onClick={() =>
                      showNotification({
                        title: "Oops!",
                        message: "This function is not developed yet.",
                        color: "yellow",
                      })
                    }
                  >
                    <IconFile size={36} stroke={1.5} />
                    <Title className={classes.mewnuTitle}>
                      <FormattedMessage id="New project" />
                    </Title>
                  </ActionIcon>
                </Grid.Col>
                <Grid.Col span={4}>
                  <FileButton
                    accept="application/zip"
                    onChange={(file) => {
                      LoadFile(file, dispatch).then((result) => {
                        if (result) navigate(links[links.length - 1].link);
                      });
                    }}
                  >
                    {(props) => (
                      <ActionIcon
                        color="gray"
                        variant="subtle"
                        className={classes.menu}
                        {...props}
                      >
                        <IconFolder size={36} stroke={1.5} />
                        <Title className={classes.mewnuTitle}>
                          <FormattedMessage id="Load project" />
                        </Title>
                      </ActionIcon>
                    )}
                  </FileButton>
                </Grid.Col>
                <Grid.Col span={4}>
                  <ActionIcon
                    color="gray"
                    variant="subtle"
                    className={classes.menu}
                    onClick={() =>
                      SaveFile(
                        data,
                        layer,
                        fontMap,
                        drawLayout,
                        paperLayout,
                        condition,
                        exclude
                      )
                    }
                  >
                    <IconDeviceFloppy size={36} stroke={1.5} />
                    <Title className={classes.mewnuTitle}>
                      <FormattedMessage id="Save project" />
                    </Title>
                  </ActionIcon>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Link lang="en" to="">
                    <ActionIcon
                      color="gray"
                      variant="subtle"
                      className={classes.menu}
                    >
                      <Image width={36} src="/asset/flag/us.svg" alt="us" />
                      <Title className={classes.mewnuTitle}>English</Title>
                    </ActionIcon>
                  </Link>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Link lang="ko" to="">
                    <ActionIcon
                      color="gray"
                      variant="subtle"
                      className={classes.menu}
                    >
                      <Image width={36} src="/asset/flag/kr.svg" alt="kr" />
                      <Title className={classes.mewnuTitle}>한국어</Title>
                    </ActionIcon>
                  </Link>
                </Grid.Col>
                <Grid.Col span={4}>
                  <ActionIcon
                    color={dark ? "yellow" : "blue"}
                    variant="subtle"
                    className={classes.menu}
                    onClick={() => toggleColorScheme()}
                  >
                    {dark ? (
                      <IconSun size={36} stroke={1.5} />
                    ) : (
                      <IconMoonStars size={36} stroke={1.5} />
                    )}
                    <Title className={classes.mewnuTitle}>
                      <FormattedMessage
                        id={dark ? "Light mode" : "Dark mode"}
                      />
                    </Title>
                  </ActionIcon>
                </Grid.Col>
              </Grid>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Container>
      <Box
        className={classes.noneLargerThanXS}
        opacity={opened ? 1 : 0}
        style={{
          width: "100%",
          background: dark ? theme.colors.dark[7] : theme.white,
          visibility: opened ? "visible" : "hidden",
          transition: "0.2s",
        }}
      >
        {links.map(({ link, label, icon }) => (
          <Link to={link} key={label} onClick={close}>
            <NavLink
              label={<FormattedMessage id={label} />}
              icon={icon}
              fw={600}
              p={16}
              style={{
                color: (
                  link === "/" ? pathname === "/" : pathname.startsWith(link)
                )
                  ? theme.colors.blue[6]
                  : dark
                  ? theme.colors.dark[0]
                  : theme.colors.dark[6],
              }}
            />
          </Link>
        ))}
      </Box>
    </Header>
  );
}
