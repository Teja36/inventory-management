import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Paper,
  Group,
  Button,
  Checkbox,
  Anchor,
  Stack,
  createStyles,
  Title,
  Space,
  Center,
} from "@mantine/core";
import { useToggle, upperFirst } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  createUser,
  removeUser,
  sendPasswordResetMail,
  signInUser,
} from "../../firebase/fireAuth";
import { getUserInfo } from "../../firebase/fireStore";

import { useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import Logo from "../../components/common/Logo";

const useStyles = createStyles(() => ({
  paper: {
    position: "fixed",
    left: "50%",
    top: "50%",
    translate: "-50% -50%",
    "@media (max-width: 545px)": {
      width: "80%",
    },
  },
}));

const Login = () => {
  const { classes } = useStyles();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [type, toggle] = useToggle(["login", "register"]);

  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      phone: "",
      terms: false,
    },

    validate: (values) => {
      if (type === "login") {
        return {
          email: /\S+@\S+\.\S+/.test(values.email)
            ? null
            : "Please enter a valid email.",
          password:
            values.password.length < 6
              ? "Password should include at least 6 characters."
              : null,
        };
      } else {
        return {
          name: !values.name
            ? "Name can't be empty"
            : values.name.match(/^\d/)
            ? "Name can't start with a number"
            : null,
          email: /\S+@\S+\.\S+/.test(values.email)
            ? null
            : "Please enter a valid email.",
          phone: /^(\+91[\-\s]?)?[ 0]?( 91)?[ 789]\d{10}$/.test(values.phone)
            ? null
            : "Invalid phone number",
          password:
            values.password.length < 6
              ? "Password should include at least 6 characters."
              : null,
        };
      }
    },
  });

  const handleRegister = async () => {
    setLoading(true);

    await createUser(
      form.values.email,
      form.values.password,
      form.values.name,
      form.values.phone
    );
    navigate("/");
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { uid, displayName, email, photoURL } = await signInUser(
        form.values.email,
        form.values.password
      );
      const userInfo = await getUserInfo(uid);

      if (!userInfo.exists) {
        await removeUser(userInfo);
        throw new Error("User not found!");
      } else if (userInfo.status === "disabled") {
        throw new Error("Account disabled by admin");
      } else {
        dispatch(
          setUser({
            info: userInfo,
            data: { uid, displayName, email, photoURL },
          })
        );
      }
    } catch (err) {
      if (err.message === "auth/user-not-found")
        form.setFieldError("email", "User doesn't exist");
      else if (err.message === "auth/wrong-password")
        form.setFieldError("password", "Wrong password");
      else form.setFieldError("email", err.message);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (type === "register") handleRegister();
    else handleLogin();
  };

  const handleForgotPassword = async () => {
    form.validateField("email");
    const isMailSent = await sendPasswordResetMail(form.values.email);
    if (isMailSent)
      showNotification({
        title: "Email sent!",
        message: "Check your inbox for password reset link.",
      });
  };

  return (
    <Paper radius="md" p="xl" withBorder shadow="md" className={classes.paper}>
      <Center>
        <Logo size={140} />
      </Center>
      <Title order={1} align="center">
        {upperFirst(type)}
      </Title>

      <Space h="md" />

      <form
        onSubmit={form.onSubmit(() => {
          handleSubmit();
        })}
      >
        <Stack>
          {type === "register" && (
            <TextInput
              label="Name"
              placeholder="Your name"
              withAsterisk
              {...form.getInputProps("name")}
            />
          )}

          <TextInput
            label="Email"
            placeholder="hello@gmail.com"
            {...form.getInputProps("email")}
            withAsterisk
          />

          {type === "register" && (
            <TextInput
              label="Phone"
              placeholder="+91 1234567890"
              withAsterisk
              {...form.getInputProps("phone")}
            />
          )}

          <PasswordInput
            label="Password"
            placeholder="Your password"
            {...form.getInputProps("password")}
            withAsterisk
          />

          {type === "login" && (
            <Anchor
              align="left"
              component="button"
              type="button"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </Anchor>
          )}

          {type === "register" && (
            <Checkbox
              label="I accept terms and conditions"
              {...form.getInputProps("terms", { type: "checkbox" })}
            />
          )}
        </Stack>

        <Group position="apart" mt="xl">
          <Anchor
            component="button"
            type="button"
            color="dimmed"
            onClick={() => {
              toggle();
              form.clearErrors();
            }}
            size="xs"
          >
            {type === "register"
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </Anchor>
          <Button
            type="submit"
            loading={loading}
            disabled={type === "register" && !form.values.terms}
          >
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default Login;
