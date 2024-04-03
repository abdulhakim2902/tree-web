import { Grid, Paper, Typography } from "@mui/material";
import { TOKEN_KEY, USER_KEY } from "@tree/src/constants/storage-key";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { allFamilyNodes } from "@tree/src/lib/services/node";
import { me } from "@tree/src/lib/services/user";
import { Family } from "@tree/src/types/tree";
import ballS from "@tree/styles/Ball.module.css";
import s from "@tree/styles/FamilyPage.module.css";
import classNames from "classnames";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import type { GetServerSidePropsContext, NextPage } from "next";
import Image from "next/image";

type FamiliesPageProps = {
  families: Family[];
};

const FamiliesPage: NextPage<FamiliesPageProps> = ({ families }) => {
  const { rootNodes } = useTreeNodeDataContext();

  return (
    <div className={s.pageContainer}>
      <div className={s.content}>
        <div className={s.descriptionContainer}>
          <div className={classNames(s.titleContainer, s.descriptionItem)}>
            <div className={s.logoContainer}>
              <Image src="/LogoBig.png" width={120} height={110} alt="tree" />
            </div>
            <span className={s.logoTitle}>FAMILIES</span>
          </div>
        </div>
        <Grid container columnSpacing={{ xs: 1, sm: 2 }} rowSpacing={1}>
          {families.map((family) => (
            <Grid key={family.id} item xs={6} sm={4} md={3}>
              <Paper
                onClick={() => rootNodes(family.id)}
                sx={{
                  padding: 2,
                  textAlign: "center",
                  height: "70px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#2f2f5e",
                  cursor: "pointer",
                  ":hover": {
                    opacity: "80%",
                  },
                }}
              >
                <Typography fontSize={12} sx={{ color: "whitesmoke" }}>
                  {family.name.toUpperCase()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
      <div className={s.imageContainer}>
        <div className={ballS.ball1} />
        <div className={ballS.ball2} />
        <div className={ballS.ball3} />
        <div className={ballS.ball4} />
        <div className={ballS.ball5} />
      </div>
    </div>
  );
};

export default FamiliesPage;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const families = [] as Family[];
  const token = getCookie(TOKEN_KEY, ctx)?.toString();

  try {
    if (!token) throw new Error("Token not found");

    const user = await me(token);
    setCookie(USER_KEY, user, ctx);

    const { data } = await allFamilyNodes(token);
    families.push(...data);

    return {
      props: {
        families,
      },
    };
  } catch {
    // ignore
  }

  deleteCookie(USER_KEY);
  deleteCookie(TOKEN_KEY);

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
}
