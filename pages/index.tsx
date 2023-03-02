import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { HeaderSimple } from "@/components/header";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { ActionIcon, Flex, Grid, Group, Paper, Stack } from "@mantine/core";
import { IconDeviceFloppy, IconFolder } from "@tabler/icons-react";

export const defaultLocale = "en";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? defaultLocale, ["common"])),
  },
});

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("Label Generator")}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HeaderSimple />
      <Flex>
        <Paper
          withBorder
          shadow="xs"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <ActionIcon size={128}>
            <IconFolder size={96} />
          </ActionIcon>
        </Paper>
        <ActionIcon size={128}>
          <IconDeviceFloppy size={96} />
        </ActionIcon>
      </Flex>
    </>
  );
}
