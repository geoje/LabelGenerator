import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { HeaderSimple } from "@/components/header";
import { defaultLocale } from "@/pages";
import Head from "next/head";
import { Grid } from "@mantine/core";
import { Size } from "@/components/paper/size";
import { Adjust } from "@/components/paper/adjust";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? defaultLocale, ["common"])),
  },
});

export default function Template() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("Paper") + " - " + t("Label Generator")}</title>
      </Head>
      <HeaderSimple />
      <Grid m={0} p="sm" pt="lg">
        <Grid.Col md={2}>
          <Size />
        </Grid.Col>
        <Grid.Col md={10}>
          <Adjust />
        </Grid.Col>
      </Grid>
    </>
  );
}
