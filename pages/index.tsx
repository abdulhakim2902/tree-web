import React, { ChangeEvent, useEffect, useState } from "react";
import type { GetServerSidePropsContext, NextPage } from "next";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import s from "@tree/styles/HomePage.module.css";
import ballS from "@tree/styles/Ball.module.css";
import Button from "@tree/src/components/Button/Button";
import classNames from "classnames";
import { TOKEN_KEY, USER_KEY } from "@tree/src/constants/storage-key";
import { useAuthContext } from "@tree/src/context/auth";
import ShowIf from "@tree/src/components/show-if";
import { useMounted } from "@tree/src/hooks/use-mounted.hook";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { useSnackbar } from "notistack";
import { Register } from "@tree/src/types/auth";
import { Role, UserStatus } from "@tree/src/types/user";
import { getInvitation, me } from "@tree/src/lib/services/user";
import RegisterModal from "@tree/src/components/Modal/RegisterModal";
import * as emailValidation from "email-validator";
import { startCase } from "lodash";
import AccountVerification from "@tree/src/components/Modal/AccountVerificationModal";

const defaultRegister = {
  name: "",
  username: "",
  password: "",
  token: "",
  email: "",
  role: Role.GUEST,
};

const HomePage: NextPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { logout, registering: loading, register, isLoggedIn } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { isMounted } = useMounted();

  const [data, setData] = useState<Register>({ ...defaultRegister });
  const [error, setError] = useState({ name: false, username: false, password: false, email: false });
  const [open, setOpen] = useState<boolean>(false);
  const [openVerification, setOpenVerification] = useState<boolean>(false);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (token === null) return;

    const handleInvitation = async () => {
      try {
        if (!token) throw new Error("Invalid token");

        const { status, email, role } = await getInvitation(token);

        switch (status) {
          case UserStatus.REGISTRATION: {
            setOpenVerification(true);
            setData((prev) => ({
              ...prev,
              token,
              email,
              role,
              name: "name",
              username: "username",
              password: "password",
            }));
            break;
          }

          case UserStatus.NEW_USER: {
            setOpen(true);
            setData((prev) => ({ ...prev, token, email, role }));
            break;
          }

          default:
            throw new Error("Invalid invitation status");
        }
      } catch {
        enqueueSnackbar({
          variant: "error",
          message: "Expired token",
        });
      } finally {
        router.replace(router.pathname, undefined, { shallow: true });
      }
    };

    handleInvitation();
  }, [token]);

  const onChange = (event: ChangeEvent<HTMLInputElement>, types: string) => {
    if (types === "username") {
      let error = false;
      if (!event.target.value) {
        error = true;
      } else if (event.target.value.split(" ").length > 1) {
        error = true;
      }

      setError((prev) => ({ ...prev, username: error }));
      setData((prev) => ({ ...prev, username: event.target.value.toLowerCase() }));
    }

    if (types === "email") {
      const valid = emailValidation.validate(event.target.value);
      setError((prev) => ({ ...prev, email: !valid }));
      setData((prev) => ({ ...prev, email: event.target.value.toLowerCase() }));
    }

    if (types === "password") {
      let error = false;
      if (!event.target.value) {
        error = true;
      } else if (event.target.value.split(" ").length > 1) {
        error = true;
      }

      if (event.target.value.length < 6) {
        error = true;
      }

      setError((prev) => ({ ...prev, password: error }));
      setData((prev) => ({ ...prev, password: event.target.value }));
    }

    if (types === "name") {
      let error = false;
      if (!event.target.value) {
        error = true;
      }

      setError((prev) => ({ ...prev, name: error }));
      setData((prev) => ({ ...prev, name: event.target.value }));
    }
  };

  const onRegister = async (cb?: () => void) => {
    for (const key in data) {
      if (data.token && key === "email") continue;
      if (data.email && key === "token") continue;
      if (!Boolean(data[key as keyof typeof data])) {
        return enqueueSnackbar({
          variant: "error",
          message: `${startCase(key)} cannot be empty`,
        });
      }
    }

    for (const key in error) {
      if (Boolean(error[key as keyof typeof error])) {
        return enqueueSnackbar({
          variant: "error",
          message: `Invalid ${key}`,
        });
      }
    }

    register(data, (success, user, statusCode) => {
      if (success) {
        setOpen(false);
        setOpenVerification(false);
        setData({ ...defaultRegister });

        const option = {
          variant: "success",
          message: "",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        };

        if (user?.role) {
          option.message = `Your role is ${user.role}. You can now sign in with the new role.`;
        } else {
          option.message = `You are successfully signing up as ${Role.GUEST}. Please check your email to verified your email.`;
        }

        enqueueSnackbar(option);
        logout();
      }

      if (statusCode === 422) {
        setOpenVerification(false);
      }

      cb && cb();
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <React.Fragment>
      <div className={s.pageContainer}>
        <div className={s.content}>
          <span className={classNames(s.descriptionItem, s.title)}>Tree Project</span>
          <div className={s.buttonsContainer}>
            <Button href="/tree" text="View Tree" className={s.descriptionItem} />
            <ShowIf condition={isLoggedIn}>
              <Button href="/families" text="View Families" className={s.descriptionItem} isSecondary={true} />
            </ShowIf>
            <ShowIf condition={!isLoggedIn}>
              <Button text="Sign Up" className={s.descriptionItem} isSecondary={true} onClick={() => setOpen(true)} />
            </ShowIf>
          </div>
        </div>
        <div className={s.imageContainer}>
          <div className={ballS.ball1} />
          <div className={ballS.ball2} />
          <div className={ballS.ball3} />
          <div className={ballS.ball4} />
          <div className={ballS.ball5} />
        </div>
      </div>
      <RegisterModal
        open={open}
        value={data}
        error={error}
        onChange={onChange}
        register={onRegister}
        loading={loading}
        onClose={() => {
          setOpen(false);
          setData({ ...defaultRegister });
          setError({ name: false, username: false, password: false, email: false });
        }}
      />
      <AccountVerification
        open={openVerification}
        email={data.email ?? ""}
        loading={loading}
        verify={onRegister}
        onClose={() => {
          setOpenVerification(false);
          setData({ ...defaultRegister });
          setError({ name: false, username: false, password: false, email: false });
        }}
      />
    </React.Fragment>
  );
};

export default HomePage;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const token = getCookie(TOKEN_KEY, ctx)?.toString();

  try {
    if (!token) throw new Error("Token not found");

    const user = await me(token);
    setCookie(USER_KEY, user, ctx);
  } catch {
    deleteCookie(USER_KEY, ctx);
    deleteCookie(TOKEN_KEY, ctx);
  }

  return {
    props: {},
  };
}
