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
} from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import { createPathWithLocale } from "@/lib/tool";

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
    paddingRight: "16px",
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
    padding: "8px 12px",
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
}));

export function HeaderSimple() {
  const theme = useMantineTheme();
  const { classes, cx } = useStyles();
  const dark = theme.colorScheme === "dark";

  const { t, i18n } = useTranslation("common");

  const [opened, { close, toggle }] = useDisclosure(false);
  const [user, setUser]: [
    (
      | { name: string; email: string; image: string; provider: string }
      | undefined
    ),
    any
  ] = useState();

  useEffect(() => {
    axios
      .get(process.env.NEXT_PUBLIC_AUTH_HOST + "/api/user/info", {
        withCredentials: true,
      })
      .then((res) => res.data)
      .then(setUser)
      .catch(console.error);
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
        ></Group>

        <Group spacing="xs" className={classes.links}>
          {user ? (
            <Menu withArrow shadow="md" position={"bottom-end"}>
              <Menu.Target>
                <ActionIcon variant="subtle" size={48} radius="xl">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "profile"}
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
                  {user.provider == "google" ? (
                    <Image
                      src={
                        process.env.NEXT_PUBLIC_AUTH_HOST +
                        "/asset/logo/google.svg"
                      }
                      width={16}
                      alt="google"
                    />
                  ) : user.provider == "naver" ? (
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
                  <Menu.Label>{user.name}</Menu.Label>
                </Group>
                <Menu.Label>{user.email}</Menu.Label>

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
                <Link
                  href={
                    process.env.NEXT_PUBLIC_AUTH_HOST +
                    createPathWithLocale("/logout", i18n.language)
                  }
                >
                  <Menu.Item icon={<IconLogout size={14} />}>
                    {t("Logout")}
                  </Menu.Item>
                </Link>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Link
              href={
                process.env.NEXT_PUBLIC_AUTH_HOST +
                createPathWithLocale("/login?callbackUrl=", i18n.language)
              }
            >
              <Button className={classes.linkAuth}>{t("Login")}</Button>
            </Link>
          )}
        </Group>
      </Container>
    </Header>
  );
}
