import {
  createStyles,
  Header,
  Container,
  Group,
  Burger,
  Image,
  MantineTheme,
  ActionIcon,
  Button,
  useMantineTheme,
  Menu,
  Paper,
  Breadcrumbs,
  Text,
  FileButton,
  Tooltip,
  Box,
  NavLink,
  Popover,
  Grid,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import process from "process";
import axios from "axios";
import {
  IconUserCircle,
  IconCoins,
  IconTrash,
  IconLogout,
  IconFile,
  IconFolder,
  IconDeviceFloppy,
  IconChevronRight,
  IconPlugX,
  IconBrush,
  IconPrinter,
  IconFileSpreadsheet,
  IconGridDots,
  IconWorld,
  IconSun,
  IconMoonStars,
} from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import { createPathWithLocale, LoadFile, SaveFile } from "@/lib/tool";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const STATUS = {
  LOAD: 0,
  GOOD: 1,
  BAD: 2,
};
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

  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { classes, cx } = useStyles();
  const dark = colorScheme === "dark";

  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [authStatus, setAuthStatus]: [number, any] = useState(STATUS.LOAD);
  const [opened, { close, toggle }] = useDisclosure(false);
  const [session, setSession]: any = useState({});

  useEffect(() => {
    axios
      .get(process.env.NEXT_PUBLIC_AUTH_HOST + "/api/auth/session", {
        withCredentials: true,
      })
      .then((res) => {
        setAuthStatus(STATUS.GOOD);
        return res.data;
      })
      .then(setSession)
      .catch(() => setAuthStatus(STATUS.BAD));
  }, []);

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

        <Link href="/" className={cx(classes.link, classes.linkLogo)}>
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
              <Link href={link} key={label}>
                <ActionIcon
                  variant="transparent"
                  className={cx(classes.link, {
                    [classes.linkActive]:
                      link === "/"
                        ? router.pathname === "/"
                        : router.pathname.startsWith(link),
                  })}
                >
                  {t(label)}{" "}
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
                        message:
                          "This function is not developed yet. Please contact to info@womosoft.com.",
                        color: "yellow",
                      })
                    }
                  >
                    <IconFile size={36} stroke={1.5} />
                    <Title className={classes.mewnuTitle}>
                      {t("New project")}
                    </Title>
                  </ActionIcon>
                </Grid.Col>
                <Grid.Col span={4}>
                  <FileButton
                    accept="application/zip"
                    onChange={(file) => {
                      LoadFile(file, dispatch);
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
                          {t("Load project")}
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
                      {t("Save project")}
                    </Title>
                  </ActionIcon>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Link locale="en" href={router.asPath}>
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
                  <Link locale="ko" href={router.asPath}>
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
                      {t(dark ? "Light mode" : "Dark mode")}
                    </Title>
                  </ActionIcon>
                </Grid.Col>
              </Grid>
            </Popover.Dropdown>
          </Popover>
          {session.user ? (
            <Menu withArrow shadow="md" position={"bottom-end"}>
              <Menu.Target>
                <ActionIcon variant="subtle" size={48} radius="xl">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "profile"}
                      width={36}
                      height={36}
                      radius="xl"
                      imageProps={{ referrerPolicy: "no-referrer" }}
                    />
                  ) : (
                    <IconUserCircle size={36} />
                  )}
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Group pl="sm" spacing={0}>
                  {session.user.provider == "google" ? (
                    <Image
                      src={
                        process.env.NEXT_PUBLIC_AUTH_HOST +
                        "/asset/logo/google.svg"
                      }
                      width={16}
                      alt="google"
                    />
                  ) : session.user.provider == "naver" ? (
                    <Paper bg="#03C75A" radius={0} p={4}>
                      <Image
                        src={
                          process.env.NEXT_PUBLIC_AUTH_HOST +
                          "/asset/logo/naver.svg"
                        }
                        width={8}
                        alt="naver"
                      />
                    </Paper>
                  ) : null}
                  <Menu.Label>{session.user.name}</Menu.Label>
                </Group>
                <Menu.Label>{session.user.email}</Menu.Label>

                <Link
                  href={
                    process.env.NEXT_PUBLIC_AUTH_HOST +
                    createPathWithLocale("/credit", i18n.language)
                  }
                >
                  <Menu.Divider />
                  <Menu.Item icon={<IconCoins size={14} />}>
                    {t("Credit")}
                  </Menu.Item>
                </Link>

                <Menu.Divider />
                <Menu.Item
                  color="red"
                  icon={<IconTrash size={14} />}
                  onClick={() =>
                    showNotification({
                      title: "Oops!",
                      message: "This function is not developed yet.",
                      color: "yellow",
                    })
                  }
                >
                  {t("Delete my account")}
                </Menu.Item>

                <Menu.Divider />
                <Menu.Item
                  icon={<IconLogout size={14} />}
                  onClick={() => {
                    router.push(
                      process.env.NEXT_PUBLIC_AUTH_HOST +
                        "/api/auth/signout?callbackUrl=" +
                        window.location.href
                    );
                    // axios
                    //   .post(
                    //     process.env.NEXT_PUBLIC_AUTH_HOST + "/api/auth/signout"
                    //   )
                    //   .then(console.log)
                    //   .catch(console.error);
                  }}
                >
                  {t("Logout")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Button
              className={classes.linkAuth}
              loading={authStatus === STATUS.LOAD}
              leftIcon={authStatus === STATUS.BAD ? <IconPlugX /> : null}
              color={authStatus === STATUS.BAD ? "gray" : ""}
              onClick={async () => {
                router.push(
                  process.env.NEXT_PUBLIC_AUTH_HOST +
                    createPathWithLocale(
                      "/login?callbackUrl=" + window.location.href,
                      i18n.language
                    )
                );
              }}
            >
              {t("Login")}
            </Button>
          )}
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
          <Link href={link} key={label} onClick={close}>
            <NavLink
              label={t(label)}
              icon={icon}
              fw={600}
              p={16}
              style={{
                color: (
                  link === "/"
                    ? router.pathname === "/"
                    : router.pathname.startsWith(link)
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
