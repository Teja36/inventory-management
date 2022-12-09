import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Grid,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";

import { useForm } from "@mantine/form";

import { showNotification } from "@mantine/notifications";

import { IconAt, IconCheck, IconLock, IconUser } from "@tabler/icons";

import { changeUserName, reauthenticateUser } from "../../firebase/fireAuth";

import { useDispatch, useSelector } from "react-redux";
import { updateName, updatePhone } from "../../redux/userSlice";

import ProfilePhoto from "../../components/Profile/ProfilePhoto";
import { updateUserInfo } from "../../firebase/fireStore";

const iconSize = 18;

const Account = () => {
  const {
    userData: { uid, displayName, photoURL, email },
    userInfo: { phone },
  } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      firstname: displayName.split(" ")[0],
      lastname:
        displayName.split(" ")[1] != undefined ? displayName.split(" ")[1] : "",
      username: displayName,
      phone: phone,
      password: "",
    },

    validate: {
      firstname: (value) => {
        if (!value) return "Firstname can't be empty";
        else if (value.match(/^\d/)) return "Name can't start with a number";
        else return null;
      },

      lastname: (value) =>
        value.match(/^\d/) ? "Name can't start with a number" : null,
      phone: (value) =>
        /^(\+91[\-\s]?)?[ 0]?( 91)?[ 789]\d{10}$/.test(value)
          ? null
          : "Invalid phone number",

      password: (value) => (value ? null : "Password can't be empty"),
    },
  });

  useEffect(() => {
    const name = `${form.values.firstname} ${form.values.lastname}`;

    form.setFieldValue("username", name);
  }, [form.values.firstname, form.values.lastname]);

  const handleSubmit = async (values) => {
    setLoading(true);

    const err = await reauthenticateUser(values.password);

    if (err) {
      form.setFieldError("password", "Wrong password");
      setLoading(false);
      return;
    }

    if (values.username !== "") {
      await changeUserName(values.username);
      dispatch(updateName(values.username));
    }

    if (values.phone !== "") {
      await updateUserInfo(uid, values.username, values.phone);
      dispatch(updatePhone(values.phone));
    }

    showNotification({
      title: "Success!",
      message: "Profile updated.",
      icon: <IconCheck size={16} />,
    });
    form.setFieldValue("password", "");
    setLoading(false);
  };

  return (
    <Stack>
      <Title order={1}>User Profile</Title>

      <Card>
        <Stack>
          <ProfilePhoto name={displayName} photoURL={photoURL} />

          <form
            onSubmit={form.onSubmit((values) => handleSubmit(values))}
            onReset={() => form.reset()}
          >
            <Grid columns={2} mt="xl">
              <Grid.Col sm={2} md={1}>
                <TextInput
                  label="First Name"
                  {...form.getInputProps("firstname")}
                  placeholder="John"
                />
              </Grid.Col>

              <Grid.Col sm={2} md={1}>
                <TextInput
                  label="Last Name"
                  {...form.getInputProps("lastname")}
                  placeholder="Doe"
                />
              </Grid.Col>

              <Grid.Col sm={2} md={1}>
                <TextInput
                  value={email}
                  disabled
                  label={"Email"}
                  icon={<IconAt size={iconSize} />}
                />
              </Grid.Col>

              <Grid.Col sm={2} md={1}>
                <TextInput
                  label="Phone"
                  {...form.getInputProps("phone")}
                  placeholder="+91 1234567890"
                />
              </Grid.Col>

              <Grid.Col sm={2} md={1}>
                <TextInput
                  readOnly
                  label={"Username"}
                  icon={<IconUser size={iconSize} />}
                  {...form.getInputProps("username")}
                />
              </Grid.Col>

              <Grid.Col sm={2} md={1}>
                <PasswordInput
                  placeholder="Enter your password"
                  label={"Password"}
                  icon={<IconLock size={iconSize} />}
                  {...form.getInputProps("password")}
                  withAsterisk
                />
              </Grid.Col>
            </Grid>

            <Group mt="xl">
              <Button type="submit" loading={loading}>
                Submit
              </Button>

              <Button variant="outline" type="reset">
                Cancel
              </Button>
            </Group>
          </form>
        </Stack>
      </Card>
    </Stack>
  );
};

export default Account;
