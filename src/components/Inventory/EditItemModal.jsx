import { useEffect, useState } from "react";

import {
  Button,
  Grid,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
  Text,
  TextInput,
} from "@mantine/core";

import { useForm } from "@mantine/form";

import pick from "lodash/pick";

import { showNotification } from "@mantine/notifications";

import { IconAlertTriangle, IconCheck } from "@tabler/icons";

import {
  addSelectItem,
  getSelectItems,
  locateItemByID,
  updateItem,
  updateLocationOfItem,
} from "../../firebase/fireStore";

const racks = {
  left: ["top", "bottom"],
  right: ["top", "middle", "bottom"],
  bottom: [],
};

const EditItemModal = ({ record, handleSuccess, handleClose }) => {
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState({});

  const [rackData, setRackData] = useState([]);

  const [step, setStep] = useState(0);

  const form = useForm({
    initialValues: {
      name: record.name,
      potency: record.potency,
      size: record.size,
      brand: record.brand,
      qty: record.qty,
      shelf: "",
      rack: "",
      row: null,
      column: null,
    },

    validate: (values) => {
      if (step === 0) {
        return {
          name: values.name ? null : "Name can't be empty",
          potency: values.potency ? null : "This field is required",
          size: values.size ? null : "This field is required",
          brand: values.brand ? null : "This field is required",
        };
      }

      if (step === 1) {
        return {
          shelf: values.shelf ? null : "This field is required",
          rack:
            rackData.length > 0 && !values.rack
              ? "This field is required"
              : null,
          row: values.row ? null : "This field is required",
          column: values.column ? null : "This field is required",
        };
      }
      return {};
    },
  });

  useEffect(() => {
    setLoading(true);
    const getLists = async () => {
      const potencyList = await getSelectItems("potency").then((data) => data);
      const sizeList = await getSelectItems("size").then((data) => data);
      const brandList = await getSelectItems("brand").then((data) => data);
      setLists({ potency: potencyList, size: sizeList, brand: brandList });
      setLoading(false);
    };
    getLists();
  }, []);

  useEffect(() => {
    (async () => {
      const location = await locateItemByID(record.uid);
      if (location) {
        form.setValues({ ...location });
      }
    })();
  }, []);

  useEffect(() => {
    if (form.isDirty("shelf")) {
      setRackData(racks[form.values.shelf]);
      form.setFieldValue("rack", "");
    }
  }, [form.values.shelf]);

  const shouldUpdateItem = () => {
    return (
      form.isDirty("name") ||
      form.isDirty("potency") ||
      form.isDirty("brand") ||
      form.isDirty("qty")
    );
  };

  const handleSubmit = async (values) => {
    if (form.isDirty() === false) return;
    try {
      const data = Object.keys(values).reduce((result, key) => {
        if (key === "qty" || key === "row" || key === "column")
          result[key] = values[key];
        else result[key] = values[key].toLowerCase().trim();

        return result;
      }, {});

      const itemData = pick(data, ["name", "potency", "size", "brand", "qty"]);

      const locationData = pick(data, ["shelf", "rack", "row", "column"]);

      if (shouldUpdateItem())
        await updateItem(record.uid, record.potency, itemData, locationData);

      await updateLocationOfItem(record.uid, locationData);

      showNotification({
        title: "Success",
        message: "Item updated.",
        icon: <IconCheck size={16} />,
      });

      form.reset();
      if (shouldUpdateItem()) handleSuccess(record.uid, data);
      handleClose();
    } catch (err) {
      showNotification({
        title: "Oops",
        message: "Something went wrong.",
        color: "red",
        icon: <IconAlertTriangle size={16} />,
      });
    }
  };

  const handleCreate = (query, name) => {
    addSelectItem(name, query);
    setLists((prev) => ({ ...prev, [name]: [...prev[name], query] }));
    return query;
  };

  const handleCancel = () => {
    form.reset();
    handleClose();
  };

  if (loading)
    return (
      <div style={{ width: 400, height: 320, position: "relative" }}>
        <LoadingOverlay visible={true} overlayBlur={2} />
      </div>
    );
  return (
    <>
      <Text mb="md">{step === 0 ? "Details" : "Location"}:</Text>

      <form
        onSubmit={form.onSubmit((values) => handleSubmit(values))}
        onReset={handleCancel}
      >
        <Grid grow gutter="md" columns={2}>
          {step === 0 && (
            <>
              <Grid.Col span={2}>
                <TextInput
                  label="Name"
                  placeholder="Medicine name"
                  withAsterisk
                  {...form.getInputProps("name")}
                />
              </Grid.Col>

              <Grid.Col span={1}>
                <Select
                  label="Potency"
                  data={lists.potency}
                  placeholder="Pick one"
                  searchable
                  nothingFound="Nothing found"
                  creatable
                  getCreateLabel={(query) => `+ Create ${query}`}
                  onCreate={(query) => handleCreate(query, "potency")}
                  withAsterisk
                  {...form.getInputProps("potency")}
                />
              </Grid.Col>

              <Grid.Col span={1}>
                <Select
                  label="Size"
                  data={lists.size}
                  placeholder="Pick one"
                  searchable
                  nothingFound="Nothing found"
                  creatable
                  getCreateLabel={(query) => `+ Create ${query}`}
                  onCreate={(query) => handleCreate(query, "size")}
                  withAsterisk
                  {...form.getInputProps("size")}
                />
              </Grid.Col>

              <Grid.Col span={1}>
                <Select
                  label="Brand"
                  data={lists.brand}
                  placeholder="Pick one"
                  searchable
                  nothingFound="Nothing found"
                  creatable
                  getCreateLabel={(query) => `+ Create ${query}`}
                  onCreate={(query) => handleCreate(query, "brand")}
                  withAsterisk
                  {...form.getInputProps("brand")}
                />
              </Grid.Col>

              <Grid.Col span={1}>
                <NumberInput
                  defaultValue={1}
                  label="Quantity"
                  min={1}
                  max={10}
                  withAsterisk
                  {...form.getInputProps("qty")}
                />
              </Grid.Col>
            </>
          )}

          {step === 1 && (
            <>
              <Grid.Col span={1}>
                <Select
                  data={["left", "right", "bottom"]}
                  label="Shelf"
                  placeholder="Pick one"
                  withAsterisk
                  {...form.getInputProps("shelf")}
                />
              </Grid.Col>

              <Grid.Col span={1}>
                <Select
                  data={rackData}
                  label="Rack"
                  placeholder="Pick one"
                  withAsterisk
                  disabled={rackData.length === 0}
                  {...form.getInputProps("rack")}
                />
              </Grid.Col>

              <Grid.Col span={1}>
                <NumberInput
                  label="Column"
                  withAsterisk
                  min={1}
                  {...form.getInputProps("column")}
                />
              </Grid.Col>

              <Grid.Col span={1}>
                <NumberInput
                  label="Row"
                  withAsterisk
                  min={1}
                  {...form.getInputProps("row")}
                />
              </Grid.Col>
            </>
          )}

          <Grid.Col span={2}>
            <Group mt="xl" position="right">
              {step === 0 && (
                <>
                  <Button type="reset" variant="outline">
                    Cancel
                  </Button>

                  <Button
                    onClick={() => {
                      form.validate();
                      if (form.isValid()) setStep(1);
                    }}
                  >
                    Next
                  </Button>
                </>
              )}

              {step === 1 && (
                <>
                  <Button variant="outline" onClick={() => setStep(0)}>
                    Back
                  </Button>

                  <Button type="submit">Save</Button>
                </>
              )}
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </>
  );
};

export default EditItemModal;
