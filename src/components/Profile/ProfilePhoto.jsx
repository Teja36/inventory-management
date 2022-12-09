import { useEffect, useState } from "react";

import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  createStyles,
  FileButton,
  Group,
  LoadingOverlay,
  Title,
} from "@mantine/core";

import { IconPencil } from "@tabler/icons";

import { useDispatch } from "react-redux";
import { updatePhotoURL } from "../../redux/userSlice";

import { changeProfilePicture } from "../../firebase/fireAuth";
import { uploadTempProfilePhoto } from "../../firebase/storage";
import { showNotification } from "@mantine/notifications";
import { useMediaQuery } from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
  banner: {
    width: "100%",
    height: "80px",
    backgroundColor: theme.fn.variant({
      variant: "filled",
      color: theme.primaryColor,
    }).background,
    borderRadius: "14px 14px 0 0",
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      flexDirection: "column",
    },
  },
  profile: {
    position: "relative",
    marginTop: "-42px",
  },
  button: {
    position: "absolute",
    bottom: 5,
    right: 5,
    zIndex: 2,
    borderRadius: "50%",
    padding: "5px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.fn.variant({
      variant: "filled",
      color: theme.primaryColor,
    }).background,

    "&:hover": {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background,
        0.1
      ),
    },
  },
  title: {
    padding: "16px",
  },
  buttonGroup: {
    alignSelf: "flex-end",
    marginLeft: "auto",
  },
}));

const ProfilePhoto = ({ name, photoURL }) => {
  const { classes } = useStyles();

  const matches = useMediaQuery("(max-width: 768px)");

  const dispatch = useDispatch();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const [tempImgURL, setTempImgURL] = useState(photoURL);

  useEffect(() => {
    if (!file) return;
    setVisible(true);
    (async () => {
      const tempUrl = await uploadTempProfilePhoto(file);
      setTempImgURL(tempUrl);
      setVisible(false);
    })();
  }, [file]);

  const handleSave = async () => {
    if (file) {
      setLoading(true);
      const url = await changeProfilePicture(file);
      dispatch(updatePhotoURL(url));
      showNotification({
        title: "Success!",
        message: "Profile photo updated.",
      });
      setFile(null);
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box className={classes.banner}></Box>

      <Box className={classes.wrapper}>
        <Box className={classes.profile}>
          <Card radius="50%" p="sm">
            <LoadingOverlay visible={visible} overlayBlur={1} />
            <Avatar src={tempImgURL} radius="50%" size={100} />
          </Card>

          <FileButton
            onChange={setFile}
            accept="image/png,image/jpeg"
            className={classes.button}
          >
            {(props) => (
              <ActionIcon {...props} variant="filled">
                <IconPencil size={16} />
              </ActionIcon>
            )}
          </FileButton>
        </Box>

        <Title className={classes.title} order={2}>
          {name}
        </Title>

        <Group className={classes.buttonGroup} spacing={matches ? "xs" : "md"}>
          <Button onClick={handleSave} loading={loading}>
            Save
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setTempImgURL(photoURL);
              setFile(null);
            }}
          >
            Cancel
          </Button>
        </Group>
      </Box>
    </Box>
  );
};

export default ProfilePhoto;
