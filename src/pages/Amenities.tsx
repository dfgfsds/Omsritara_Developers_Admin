import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

// ==========================================
// AMENITY TYPE
// ==========================================

type Amenity = {
  _id?: string;
  id?: string;
  name: string;

  // Backend returns populated amenities_type object
  amenities_type?:
    | {
        _id?: string;
        id?: string;
        name?: string;
        description?: string;
      }
    | string;

  description?: string;
};

// ==========================================
// AMENITIES TYPE
// ==========================================

type AmenityType = {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
};

// ==========================================
// COMPONENT
// ==========================================

function Amenities() {
  // ==========================================
  // DATA
  // ==========================================

  const [data, setData] = useState<Amenity[]>([]);
  const [amenityTypes, setAmenityTypes] = useState<AmenityType[]>([]);

  // ==========================================
  // SEARCH & FILTER
  // ==========================================

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  // ==========================================
  // FORM
  // ==========================================

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");

  // ==========================================
  // EDIT
  // ==========================================

  const [editingId, setEditingId] = useState<string | null>(null);

  // ==========================================
  // LOADING
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [typeLoading, setTypeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // ERROR
  // ==========================================

  const [error, setError] = useState("");

  // ==========================================
  // MODAL
  // ==========================================

  const [showModal, setShowModal] = useState(false);

  // ==========================================
  // API URLS
  // ==========================================

  const AMENITIES_API =
    "https://api.omsritaradevelopers.in/amenities";

  const AMENITIES_TYPE_API =
    "https://api.omsritaradevelopers.in/amenitiestype";

  // ==========================================
  // GET ALL AMENITIES
  // ==========================================

  const getAmenities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/amenities");

      console.log(
        "AMENITIES GET RESPONSE:",
        response.data
      );

      setData(response?.data?.result || []);
    } catch (error: any) {
      console.error(
        "AMENITIES GET ERROR:",
        error
      );

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      setError(
        error.response?.data?.msg ||
          "Failed to load amenities."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GET ALL AMENITIES TYPES
  // ==========================================

  const getAmenityTypes = async () => {
    try {
      setTypeLoading(true);

      const response = await axiosInstance.get(
        "/amenitiestype"
      );

      console.log(
        "AMENITIES TYPE RESPONSE:",
        response.data
      );

      setAmenityTypes(
        response?.data?.result || []
      );
    } catch (error: any) {
      console.error(
        "AMENITIES TYPE GET ERROR:",
        error
      );

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      setError(
        error.response?.data?.msg ||
          "Failed to load amenities types."
      );
    } finally {
      setTypeLoading(false);
    }
  };

  // ==========================================
  // PAGE LOAD
  // ==========================================

  useEffect(() => {
    getAmenities();
    getAmenityTypes();
  }, []);

  // ==========================================
  // GET AMENITIES TYPE ID
  // ==========================================

  const getAmenityTypeId = (
    item: Amenity
  ): string => {
    if (
      typeof item.amenities_type === "object" &&
      item.amenities_type !== null
    ) {
      return (
        item.amenities_type._id ||
        item.amenities_type.id ||
        ""
      );
    }

    if (
      typeof item.amenities_type === "string"
    ) {
      return item.amenities_type;
    }

    const oldType = (item as any).amenitiestype;

    if (
      typeof oldType === "object" &&
      oldType !== null
    ) {
      return (
        oldType._id ||
        oldType.id ||
        ""
      );
    }

    if (typeof oldType === "string") {
      return oldType;
    }

    const anotherType =
      (item as any).amenity_type;

    if (
      typeof anotherType === "object" &&
      anotherType !== null
    ) {
      return (
        anotherType._id ||
        anotherType.id ||
        ""
      );
    }

    if (
      typeof anotherType === "string"
    ) {
      return anotherType;
    }

    return "";
  };

  // ==========================================
  // GET AMENITIES TYPE NAME
  // ==========================================

  const getAmenityTypeName = (
    item: Amenity
  ): string => {
    // Populated object
    if (
      typeof item.amenities_type === "object" &&
      item.amenities_type !== null
    ) {
      return (
        item.amenities_type.name ||
        "-"
      );
    }

    // If backend only returns ID
    const typeId =
      getAmenityTypeId(item);

    const foundType =
      amenityTypes.find(
        (t) =>
          (t._id || t.id) === typeId
      );

    return foundType?.name || "-";
  };

  // ==========================================
  // FILTERED DATA
  // ==========================================

  const filteredData = data.filter(
    (item) => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      const itemName =
        item.name
          ?.toLowerCase() || "";

      const itemDescription =
        item.description
          ?.toLowerCase() || "";

      const typeName =
        getAmenityTypeName(item)
          .toLowerCase();

      // ----------------------------------------
      // SEARCH
      // ----------------------------------------

      const matchesSearch =
        !search ||
        itemName.includes(search) ||
        itemDescription.includes(search);

      // ----------------------------------------
      // TYPE FILTER
      // ----------------------------------------

      const matchesType =
        !filterType ||
        getAmenityTypeId(item) ===
          filterType ||
        typeName ===
          amenityTypes
            .find(
              (t) =>
                (t._id || t.id) ===
                filterType
            )
            ?.name?.toLowerCase();

      return (
        matchesSearch &&
        matchesType
      );
    }
  );

  // ==========================================
  // CLEAR SEARCH & FILTER
  // ==========================================

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterType("");
  };

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const handleAddClick = () => {
    setName("");
    setType("");
    setDescription("");

    setEditingId(null);
    setError("");

    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const handleCloseModal = () => {
    setName("");
    setType("");
    setDescription("");

    setEditingId(null);
    setError("");

    setShowModal(false);
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!name.trim()) {
      setError(
        "Amenities name is required."
      );
      return;
    }

    if (!type) {
      setError(
        "Please select an amenities type."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // ----------------------------------------
      // IMPORTANT PAYLOAD
      // ----------------------------------------

      const payload = {
        name: name.trim(),
        amenities_type: type,
        description: description.trim(),
      };

      console.log(
        "AMENITY PAYLOAD:",
        payload
      );

      // ----------------------------------------
      // UPDATE
      // ----------------------------------------

      if (editingId) {
        const response =
          await axiosInstance.put(
            `/amenities/${editingId}`,
            payload
          );

        console.log(
          "UPDATE RESPONSE:",
          response.data
        );

        alert(
          "Amenity updated successfully."
        );
      }

      // ----------------------------------------
      // CREATE
      // ----------------------------------------

      else {
        const response =
          await axiosInstance.post(
            "/amenities",
            payload
          );

        console.log(
          "CREATE RESPONSE:",
          response.data
        );

        alert(
          "Amenity added successfully."
        );
      }

      // ----------------------------------------
      // CLEAR FORM
      // ----------------------------------------

      setName("");
      setType("");
      setDescription("");
      setEditingId(null);

      // Close modal
      setShowModal(false);

      // Reload table
      await getAmenities();
    } catch (error: any) {
      console.error(
        "AMENITY SUBMIT ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      setError(
        error.response?.data?.msg ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to save amenity."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (
    item: Amenity
  ) => {
    const itemId =
      item._id || item.id;

    if (!itemId) {
      setError(
        "Amenity ID not found."
      );
      return;
    }

    setEditingId(itemId);

    setName(
      item.name || ""
    );

    // Properly extract amenities_type
    const typeId =
      typeof item.amenities_type ===
        "object" &&
      item.amenities_type !== null
        ? item.amenities_type?._id ||
          item.amenities_type?.id ||
          ""
        : typeof item.amenities_type ===
          "string"
        ? item.amenities_type
        : typeof (item as any)
              .amenitiestype ===
            "object" &&
          (item as any)
            .amenitiestype !== null
        ? (item as any)
            .amenitiestype?._id ||
          (item as any)
            .amenitiestype?.id ||
          ""
        : typeof (item as any)
              .amenitiestype ===
            "string"
        ? (item as any)
            .amenitiestype
        : typeof (item as any)
              .amenity_type ===
            "object" &&
          (item as any)
            .amenity_type !== null
        ? (item as any)
            .amenity_type?._id ||
          (item as any)
            .amenity_type?.id ||
          ""
        : typeof (item as any)
              .amenity_type ===
            "string"
        ? (item as any)
            .amenity_type
        : "";

    setType(typeId);

    setDescription(
      item.description || ""
    );

    setError("");

    setShowModal(true);
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (
    item: Amenity
  ) => {
    const itemId =
      item._id || item.id;

    if (!itemId) {
      setError(
        "Amenity ID not found."
      );
      return;
    }

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete "${item.name}"?`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");

      await axiosInstance.delete(
        `/amenities/${itemId}`
      );

      alert(
        "Amenity deleted successfully."
      );

      await getAmenities();
    } catch (error: any) {
      console.error(
        "DELETE ERROR:",
        error
      );

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      setError(
        error.response?.data?.msg ||
          "Failed to delete amenity."
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex items-start justify-between mb-6">
      

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Amenities
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage amenities available for your
            properties.
          </p>
        </div>

        {/* ADD BUTTON */}

        <button
          type="button"
          onClick={handleAddClick}
          className="
            flex
            items-center
            gap-2
            rounded-lg
            bg-red-700
            px-5
            py-3
            text-sm
            font-medium
            text-white
            hover:bg-red-800
          "
        >
          <Plus size={18} />

          Add Amenities
        </button>

      </div>

      {/* ======================================
          PAGE ERROR
      ====================================== */}

      {error && !showModal && (
        <div
          className="
            mb-5
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-600
          "
        >
          {error}
        </div>
      )}

      {/* ======================================
          TABLE CARD
      ====================================== */}

      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        {/* ====================================
            TABLE HEADER
        ==================================== */}

        <div
          className="
            border-b
            px-6
            py-5
          "
        >

          <div className="flex items-center justify-between">
          

            <div>

              <h2
                className="
                  text-lg
                  font-semibold
                  text-slate-900
                "
              >
                Amenities List
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                {filteredData.length}{" "}
                {filteredData.length === 1
                  ? "amenity"
                  : "amenities"}
                {data.length !==
                  filteredData.length &&
                  ` of ${data.length}`}
              </p>

            </div>

            <span
              className="
                rounded-full
                bg-slate-100
                px-3
                py-1
                text-sm
                font-medium
                text-slate-600
              "
            >
              {filteredData.length} Total
            </span>

          </div>

          {/* ==================================
              SEARCH + FILTER
          ================================== */}

          <div
            className="
              mt-5
              flex
              flex-col
              gap-3
              md:flex-row
              md:items-center
            "
          >

            {/* SEARCH */}

            <div className="relative w-full md:w-64">
              <Search
                size={18}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search amenity name or description..."
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  py-3
                  pl-10
                  pr-4
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />

            </div>

            {/* TYPE FILTER */}

            <div className="w-full md:w-64">
       

              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(
                    e.target.value
                  )
                }
                disabled={typeLoading}
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-slate-700
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                  disabled:bg-slate-100
                "
              >

                <option value="">
                  {typeLoading
                    ? "Loading types..."
                    : "All Amenities Types"}
                </option>

                {amenityTypes.map(
                  (item) => {

                    const id =
                      item._id ||
                      item.id;

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {item.name}
                      </option>
                    );
                  }
                )}

              </select>

            </div>

            {/* CLEAR FILTER */}

            {(searchTerm ||
              filterType) && (
              <button
                type="button"
                onClick={
                  handleClearFilters
                }
                className="
                  whitespace-nowrap
                  rounded-lg
                  border
                  border-slate-300
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-slate-600
                  hover:bg-slate-50
                "
              >
                Clear
              </button>
            )}

          </div>

        </div>

        {/* ====================================
            LOADING
        ==================================== */}

        {loading ? (

          <div
            className="
              py-12
              text-center
              text-sm
              text-slate-500
            "
          >
            Loading amenities...
          </div>

        ) : data.length === 0 ? (

          <div
            className="
              py-12
              text-center
            "
          >

            <p
              className="
                text-sm
                text-slate-500
              "
            >
              No amenities found.
            </p>

            <button
              type="button"
              onClick={handleAddClick}
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-red-700
                px-4
                py-2
                text-sm
                font-medium
                text-white
                hover:bg-red-800
              "
            >
              <Plus size={16} />

              Add Amenities
            </button>

          </div>

        ) : filteredData.length === 0 ? (

          /* ==================================
             NO FILTER RESULTS
          ================================== */

          <div
            className="
              py-12
              text-center
            "
          >

            <div
              className="
                mx-auto
                mb-3
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-slate-100
              "
            >
              <Search
                size={22}
                className="text-slate-400"
              />
            </div>

            <p
              className="
                text-sm
                font-medium
                text-slate-700
              "
            >
              No amenities found
            </p>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Try changing your search or
              amenities type filter.
            </p>

            <button
              type="button"
              onClick={
                handleClearFilters
              }
              className="
                mt-4
                rounded-lg
                border
                border-slate-300
                px-4
                py-2
                text-sm
                font-medium
                text-slate-600
                hover:bg-slate-50
              "
            >
              Clear Filters
            </button>

          </div>

        ) : (

          /* ==================================
             TABLE
          ================================== */

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead
                className="
                  border-b
                  bg-slate-50
                "
              >

                <tr>

                  <th
                    className="
                      px-6
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      text-slate-500
                    "
                  >
                    #
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      text-slate-500
                    "
                  >
                    Amenities Name
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      text-slate-500
                    "
                  >
                    Amenities Type
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      text-slate-500
                    "
                  >
                    Description
                  </th>

                  <th
                    className="
                      px-6
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      text-slate-500
                    "
                  >
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {filteredData.map(
                  (item, index) => (

                    <tr
                      key={
                        item._id ||
                        item.id ||
                        index
                      }
                      className="
                        hover:bg-slate-50
                      "
                    >

                      {/* NUMBER */}

                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          text-slate-600
                        "
                      >
                        {index + 1}
                      </td>

                      {/* NAME */}

                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          font-medium
                          text-slate-900
                        "
                      >
                        {item.name}
                      </td>

                      {/* AMENITIES TYPE */}

                      <td
                        className="
                          px-6
                          py-4
                          text-sm
                          font-medium
                          text-slate-600
                        "
                      >

                        <span
                          className="
                            inline-flex
                            rounded-full
                            bg-blue-50
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-blue-700
                          "
                        >
                          {getAmenityTypeName(
                            item
                          )}
                        </span>

                      </td>

                      {/* DESCRIPTION */}

                      <td
                        className="
                          max-w-lg
                          px-6
                          py-4
                          text-sm
                          text-slate-600
                        "
                      >
                        {item.description ||
                          "-"}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                item
                              )
                            }
                            title="Edit"
                            className="
                              rounded-lg
                              border
                              border-blue-200
                              p-2
                              text-blue-600
                              hover:bg-blue-50
                            "
                          >
                            <Pencil
                              size={17}
                            />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                item
                              )
                            }
                            title="Delete"
                            className="
                              rounded-lg
                              border
                              border-red-200
                              p-2
                              text-red-600
                              hover:bg-red-50
                            "
                          >
                            <Trash2
                              size={17}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ======================================
          ADD / EDIT MODAL
      ====================================== */}

      {showModal && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/60
            p-4
          "
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-xl
              bg-white
              shadow-2xl
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                px-6
                py-5
              "
            >

              <div>

                <h2
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                  "
                >
                  {editingId
                    ? "Edit Amenity"
                    : "Add New Amenity"}
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  {editingId
                    ? "Update the amenity details."
                    : "Create a new amenity."}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseModal
                }
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <X size={20} />
              </button>

            </div>

            {/* ==================================
                FORM
            ================================== */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              {/* FORM ERROR */}

              {error && (
                <div
                  className="
                    mb-5
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    text-red-600
                  "
                >
                  {error}
                </div>
              )}

              {/* =================================
                  AMENITY NAME
              ================================= */}

              <div className="mb-5">

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Amenities Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Example: Swimming Pool"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />

              </div>

              {/* =================================
                  AMENITIES TYPE
              ================================= */}

              <div className="mb-5">

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Amenities Type
                </label>

                <select
                  value={type}
                  onChange={(e) =>
                    setType(
                      e.target.value
                    )
                  }
                  disabled={
                    typeLoading
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                    disabled:bg-slate-100
                  "
                >

                  <option value="">
                    {typeLoading
                      ? "Loading amenities types..."
                      : "Select Amenities Type"}
                  </option>

                  {amenityTypes.map(
                    (item) => {

                      const id =
                        item._id ||
                        item.id;

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {item.name}
                        </option>
                      );
                    }
                  )}

                </select>

                {/* NO TYPES */}

                {!typeLoading &&
                  amenityTypes.length ===
                    0 && (
                    <p
                      className="
                        mt-2
                        text-xs
                        text-red-500
                      "
                    >
                      No amenities types
                      found. Please
                      create an Amenities
                      Type first.
                    </p>
                  )}

              </div>

              {/* =================================
                  DESCRIPTION
              ================================= */}

              <div className="mb-6">

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Enter amenity description"
                  rows={4}
                  className="
                    w-full
                    resize-none
                    rounded-lg
                    border
                    border-slate-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />

              </div>

              {/* =================================
                  BUTTONS
              ================================= */}

              <div
                className="
                  flex
                  justify-end
                  gap-3
                "
              >

                <button
                  type="button"
                  onClick={
                    handleCloseModal
                  }
                  className="
                    rounded-lg
                    border
                    border-slate-300
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    typeLoading
                  }
                  className="
                    rounded-lg
                    bg-red-700
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-white
                    hover:bg-red-800
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                    ? "Update"
                    : "Save"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Amenities;