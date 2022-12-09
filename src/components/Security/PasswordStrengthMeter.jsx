import { Box, Text, Center, Space } from "@mantine/core";

import { IconCheck, IconX } from "@tabler/icons";

const PasswordRequirement = ({ meets, label }) => {
  return (
    <Text color={meets ? "teal" : "red"} mt={5} size="sm">
      <Center inline>
        {meets ? (
          <IconCheck size={14} stroke={1.5} />
        ) : (
          <IconX size={14} stroke={1.5} />
        )}
        <Box ml={7}>{label}</Box>
      </Center>
    </Text>
  );
};

const requirements = [
  { re: /[0-9]/, label: "A number" },
  { re: /[a-z]/, label: "A lowercase letter" },
  { re: /[A-Z]/, label: "An uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "A special symbol" },
];

const PasswordStrengthMeter = ({ value }) => {
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(value)}
    />
  ));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <Text weight={700}>Password must contain:</Text>
        <Space h="xl" />

        <PasswordRequirement
          label="At least 6 characters"
          meets={value.length > 5}
        />
        {checks}
      </div>
    </Box>
  );
};

export default PasswordStrengthMeter;
