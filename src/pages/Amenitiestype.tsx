import axios from "axios";
import React, { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

type AmenityType = {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
};

function Amenitiestype() {
  const [data, setData] = useState<AmenityType[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);

  const API_URL = "https://api.omsritaradevelopers.in/amenitiestype";

  // ==========================================
  // GET ALL AMENITIES TYPES
  // ==========================================

  const getapi = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/amenitiestype");

      console.log("GET RESPONSE:", response.data);

      setData(response?.data?.result || []);
    } catch (error) {
      console.error("GET ERROR:", error);
      setError("Failed to load amenities types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getapi();
  }, []);

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const handleAddClick = () => {
    setName("");
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
    setDescription("");
    setEditingId(null);
    setError("");

    setShowModal(false);
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Amenities type name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        name: name.trim(),
        description: description.trim(),
      };

      console.log("PAYLOAD:", payload);

      // ==============================
      // UPDATE
      // ==============================

      if (editingId) {
        const response = await axiosInstance.put(
          `/amenitiestype/${editingId}`,
          payload
        );

        console.log("UPDATE RESPONSE:", response.data);

        alert("Amenities type updated successfully.");
      }

      // ==============================
      // CREATE
      // ==============================

      else {
        const response = await axiosInstance.post("/amenitiestype", payload);

        console.log("CREATE RESPONSE:", response.data);

        alert("Amenities type added successfully.");
      }

      // Clear form
      setName("");
      setDescription("");
      setEditingId(null);

      // Close modal
      setShowModal(false);

      // Reload backend data
      getapi();
    } catch (error) {
      console.error("SUBMIT ERROR:", error);
      setError("Failed to save amenities type.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (item: AmenityType) => {
    const itemId = item._id || item.id;

    if (!itemId) {
      setError("Amenities type ID not found.");
      return;
    }

    setEditingId(itemId);

    setName(item.name || "");
    setDescription(item.description || "");

    setError("");

    setShowModal(true);
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (item: AmenityType) => {
    const itemId = item._id || item.id;

    if (!itemId) {
      setError("Amenities type ID not found.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");

      await axiosInstance.delete(`/amenitiestype/${itemId}`);

      alert("Amenities type deleted successfully.");

      getapi();
    } catch (error) {
      console.error("DELETE ERROR:", error);

      setError("Failed to delete amenities type.");
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredData = data.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      item.name?.toLowerCase().includes(searchText) ||
      item.description?.toLowerCase().includes(searchText)
    );
  });

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="flex items-start justify-between mb-6">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Amenities Type
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage amenities types available for your properties.
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

          Add Amenities Type
        </button>

      </div>

      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="relative max-w-md mb-6">

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
          placeholder="Search amenities type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            outline-none
            focus:border-red-500
            focus:ring-2
            focus:ring-red-100
          "
        />

      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && !showModal && (
        <div className="
          mb-5
          rounded-lg
          border
          border-red-200
          bg-red-50
          px-4
          py-3
          text-sm
          text-red-600
        ">
          {error}
        </div>
      )}

      {/* ======================================
          TABLE
      ====================================== */}

      <div className="
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-sm
      ">

        {/* TABLE HEADER */}

        <div className="
          flex
          items-center
          justify-between
          border-b
          border-slate-200
          px-6
          py-5
        ">

          <div>

            <h2 className="text-lg font-semibold text-slate-900">
              Amenities Type List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredData.length}{" "}
              {filteredData.length === 1 ? "type" : "types"}
            </p>

          </div>

          <span className="
            rounded-full
            bg-slate-100
            px-3
            py-1
            text-sm
            font-medium
            text-slate-600
          ">
            {filteredData.length} Total
          </span>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="py-12 text-center text-sm text-slate-500">
            Loading amenities types...
          </div>

        ) : filteredData.length === 0 ? (

          /* EMPTY */

          <div className="py-12 text-center">

            <p className="text-sm text-slate-500">
              No amenities types found.
            </p>

            <button
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
              Add Amenities Type
            </button>

          </div>

        ) : (

          /* TABLE */

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50 border-b">

                <tr>

                  <th className="
                    px-6
                    py-4
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    text-slate-500
                  ">
                    #
                  </th>

                  <th className="
                    px-6
                    py-4
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    text-slate-500
                  ">
                    Name
                  </th>

                  <th className="
                    px-6
                    py-4
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    text-slate-500
                  ">
                    Description
                  </th>

                  <th className="
                    px-6
                    py-4
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    text-slate-500
                  ">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {filteredData.map((item, index) => (

                  <tr
                    key={item._id || item.id || index}
                    className="hover:bg-slate-50"
                  >

                    {/* NUMBER */}

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {index + 1}
                    </td>

                    {/* NAME */}

                    <td className="
                      px-6
                      py-4
                      text-sm
                      font-medium
                      text-slate-900
                    ">
                      {item.name}
                    </td>

                    {/* DESCRIPTION */}

                    <td className="
                      max-w-lg
                      px-6
                      py-4
                      text-sm
                      text-slate-600
                    ">
                      <div className="max-w-lg">
                        {item.description || "-"}
                      </div>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
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
                          <Pencil size={17} />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
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
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ======================================
          ADD / EDIT MODAL
      ====================================== */}

      {showModal && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/60
          p-4
        ">

          <div className="
            w-full
            max-w-lg
            rounded-xl
            bg-white
            shadow-2xl
          ">

            {/* MODAL HEADER */}

            <div className="
              flex
              items-center
              justify-between
              border-b
              px-6
              py-5
            ">

              <div>

                <h2 className="
                  text-xl
                  font-bold
                  text-slate-900
                ">
                  {editingId
                    ? "Edit Amenities Type"
                    : "Add New Amenities Type"}
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-slate-500
                ">
                  {editingId
                    ? "Update the amenities type details."
                    : "Create a new amenities type."}
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseModal}
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

            {/* MODAL BODY */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              {/* ERROR */}

              {error && (
                <div className="
                  mb-5
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                ">
                  {error}
                </div>
              )}

              {/* NAME */}

              <div className="mb-5">

                <label className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-slate-700
                ">
                  Amenities Type Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Example: Recreation"
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

              {/* DESCRIPTION */}

              <div className="mb-6">

                <label className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-slate-700
                ">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Enter amenities type description"
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

              {/* BUTTONS */}

              <div className="
                flex
                justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  disabled={submitting}
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

export default Amenitiestype;