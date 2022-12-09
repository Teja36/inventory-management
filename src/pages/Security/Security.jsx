import {
  Button,
  PasswordInput,
  Title,
  Space,
  Stack,
  Grid,
  Card,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { changePassword } from "../../firebase/fireAuth";
import { IconCheck } from "@tabler/icons";

import PasswordStrengthMeter from "../../components/Security/PasswordStrengthMeter";

const Security = () => {
  const form = useForm({
    initialValues: {
      current: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
      current: (value) => !value && "Please enter your current password",
      password: (value, values) => {
        let msg = null;
        if (value.length < 6) msg = "Length must be atleast 6 characters";
        else if (value === values.current) msg = "Enter a new password";
        return msg;
      },
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords didn't match" : null,
    },
  });

  const handleSubmit = async (values) => {
    const err = await changePassword(values.current, values.password);
    if (err === "auth/wrong-password")
      form.setFieldError("current", "Wrong password");
    else {
      showNotification({
        title: "Success!",
        message: "Password updated.",
        icon: <IconCheck size={16} />,
      });
      form.reset();
    }
  };
  return (
    <>
      <Title order={1}>Security</Title>
      <Space h="xl" />

      <Card>
        <Stack>
          <Grid columns="2" align="center">
            <Grid.Col span={1}>
              <form
                onSubmit={form.onSubmit((values) => handleSubmit(values))}
                onReset={() => form.reset()}
              >
                <Stack>
                  <PasswordInput
                    label="Current password"
                    placeholder="Current password"
                    withAsterisk
                    {...form.getInputProps("current")}
                  />
                  <PasswordInput
                    label="New password"
                    placeholder="New password"
                    withAsterisk
                    {...form.getInputProps("password")}
                  />

                  <PasswordInput
                    label="Confirm password"
                    placeholder="Confirm password"
                    withAsterisk
                    {...form.getInputProps("confirmPassword")}
                  />

                  <Button type="submit">Save</Button>

                  <Button type="reset" variant="outline">
                    Cancel
                  </Button>
                </Stack>
              </form>
            </Grid.Col>

            <Grid.Col span={1}>
              <PasswordStrengthMeter value={form.values.password} />
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>
    </>
  );
};

export default Security;
