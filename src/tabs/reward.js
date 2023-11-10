import React, { useState, useEffect, useRef } from "react";
import firebase from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import "../css/Home.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore } from "../config/firebase";
import AnimatedPage from "../AnimatedPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

function Reward() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryCard, setShowCategoryCard] = useState(false);
  const navigate = useNavigate();
  const [emptyFieldWarning, setEmptyFieldWarning] = useState(false);
  const [category, setCategory] = useState("");  
  const [categories, setCategories] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [rewardsList, setRewardsList] = useState([]);
  const formContainerRef = useRef(null);
  const [updatingRewardId, setUpdatingRewardId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("REWARD");
  const rewardsCollectionRef = firestore.collection("rewards");
  const categoriesCollectionRef = firestore.collection("categories");
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardPoints, setNewRewardPoints] = useState("");
  const [newRewardQuantity, setNewRewardQuantity] = useState("");
  const [showAddRewardForm, setShowAddRewardForm] = useState(false);
  const [editRewardId, setEditRewardId] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [categoryPoints, setCategoryPoints] = useState(""); 
  const [categoryPointsInput, setCategoryPointsInput] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryPoints, setNewCategoryPoints] = useState("");
  const [showCategoryUpdateForm, setShowCategoryUpdateForm] = useState(false);
  const [showRewardUpdateForm, setShowRewardUpdateForm] = useState(false);
  const [categoryData, setCategoryData] = useState({});

  useEffect(() => {
    const handleClickOutsideForm = (event) => {
      if (formContainerRef.current && !formContainerRef.current.contains(event.target)) {
        if (showAddForm) {
          setShowAddForm(false);
        }
        if (updatingRewardId !== null) {
          setUpdatingRewardId(null);
        }
      }
    };
    document.addEventListener("click", handleClickOutsideForm);
    return () => {
      document.removeEventListener("click", handleClickOutsideForm);
    };
  }, [showAddForm, updatingRewardId]);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        toast.error('Please login to access the rewards page.', { autoClose: 1500, hideProgressBar: true });
        navigate('/login');
      }
    };
    checkLoggedInUser();
  }, [navigate]);

  useEffect(() => {
    const unsubscribeRewards = rewardsCollectionRef.onSnapshot((snapshot) => {
      const rewardsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRewardsList(rewardsData);
    });
    return () => {
      unsubscribeRewards();
    };
  }, []);

  useEffect(() => {
    const unsubscribeCategories = categoriesCollectionRef.onSnapshot((snapshot) => {
      const categoriesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesData);
    });
    return () => {
      unsubscribeCategories();
    };
  }, []);

  useEffect(() => {
    const unsubscribeRewards = rewardsCollectionRef
      .where("category", "==", selectedCategory)
      .onSnapshot((snapshot) => {
        const rewardsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRewardsList(rewardsData);
      });

    return () => {
      unsubscribeRewards();
    };
  }, [selectedCategory]);

  const handleAddCategory = async () => {
    if (!category) {
      toast.error('Please fill in Category.', { autoClose: 1500, hideProgressBar: true });
      return;
    }
    try {
      const newCategory = {
        category: category,
        points: categoryPointsInput,
      };
      const newCategoryRef = await categoriesCollectionRef.add(newCategory);
      setCategories([...categories, { ...newCategory, id: newCategoryRef.id }]);
      setCategory("");
      setCategoryPointsInput("");
      toast.success('Category added successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error('Failed to add category.', { autoClose: 1500, hideProgressBar: true });
    }
  }

  const closeRewardModal = () => {
    setShowRewardModal(false);
  };

  const addReward = async () => {
    if (!newRewardName || !newRewardQuantity || !selectedCategory) {
      setEmptyFieldWarning(true);
      toast.error('Please fill in all required fields.', { autoClose: 1500, hideProgressBar: true });
      return;
    }
    try {
      const categoryPoints = categories.find((cat) => cat.category === selectedCategory).points;
  
      const newReward = {
        category: selectedCategory,
        rewardName: newRewardName,
        points: categoryPoints,
        quantity: newRewardQuantity,
      };
  
      const batch = firestore.batch();
      const newRewardRef = rewardsCollectionRef.doc();
      batch.set(newRewardRef, newReward);
      await batch.commit();
      setRewardsList([...rewardsList, { ...newReward, id: newRewardRef.id }]);
      setNewRewardName("");
      setNewRewardQuantity("");
      closeRewardModal();
      toast.success('Reward added successfully!', { autoClose: 1500, hideProgressBar: true });
    } catch (error) {
      console.error("Error adding reward:", error);
      toast.error('Failed to add reward.', { autoClose: 1500, hideProgressBar: true });
    }
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  }

  const handleCategoryCardClick = (category) => {
    setSelectedCategory(category.category);
    setShowCategoryCard(true);
    setShowAddRewardForm(false);
    setCategoryPoints(category.points);
  };

  const closeCategoryCard = () => {
    setSelectedCategory(null); 
    setShowCategoryCard(false);
  }

  const tabStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    padding: "10px 40px",
    margin: "0 1px",
    marginBottom: "5px",
    color: "white",
    backgroundColor: "#659E64",
    border: "none",
    cursor: "pointer",
    width: "160px",
    height: "40px",
  };
  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: "#3f5159",
  };

  const resetInputFields = () => {
    setNewRewardName("");
    setNewRewardPoints("");
    setNewRewardQuantity("");
  }

  const updateReward = async () => {
    if (!newRewardName || !newRewardQuantity || !selectedCategory) {
      setEmptyFieldWarning(true);
      toast.error('Please fill in all required fields.', { autoClose: 1500, hideProgressBar: true });
      return;
    }
    try {
      const updatedReward = {
        category: selectedCategory,
        rewardName: newRewardName,
        points: newRewardPoints,
        quantity: newRewardQuantity,
      };
      const rewardRef = rewardsCollectionRef.doc(editRewardId);
      await rewardRef.update(updatedReward); 
      toast.success('Reward updated successfully!', { autoClose: 1500, hideProgressBar: true });
      setNewRewardName("");
      setNewRewardPoints("");
      setNewRewardQuantity("");
      setShowUpdateForm(false);
    } catch (error) {
      console.error("Error updating reward:", error);
      toast.error('Failed to update reward.', { autoClose: 1500, hideProgressBar: true });
    }
  }

  const handleUpdateReward = (e, reward) => {
    e.stopPropagation();
    setShowRewardUpdateForm(true);
    setEditRewardId(reward.id);
    setNewRewardName(reward.rewardName);
    setNewRewardPoints(reward.points);
    setNewRewardQuantity(reward.quantity);
  };
  
  const handleDeleteReward = async (e, reward) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Are you sure you want to delete the reward "${reward.rewardName}"?`); 
    if (confirmDelete) {
      try {
        const rewardRef = rewardsCollectionRef.doc(reward.id);
        await rewardRef.delete();
        toast.success('Reward deleted successfully!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
        console.error("Error deleting reward:", error);
        toast.error('Failed to delete reward.', { autoClose: 1500, hideProgressBar: true });
      }
    }
  }
  
  const handleUpdateCategory = (e, category) => {
    e.stopPropagation();
    setShowCategoryUpdateForm(true);
    setEditCategoryId(category.id);
    setNewCategoryName(category.category);
    setNewCategoryPoints(category.points);
  };

  const updateCategory = async () => {
    if (!newCategoryName || !newCategoryPoints) {
      toast.error('Please fill in both the new category name and points.', { autoClose: 1500, hideProgressBar: true });
      return;
    } 
    try {
      const categoryRef = categoriesCollectionRef.doc(editCategoryId);
      await categoryRef.update({
        category: newCategoryName,
        points: newCategoryPoints
      });
      toast.success('Category updated successfully!', { autoClose: 1500, hideProgressBar: true });
      setShowUpdateForm(false);
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error('Failed to update category.', { autoClose: 1500, hideProgressBar: true });
    }
  }
  
  const handleDeleteCategory = async (e, category) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Are you sure you want to delete the category "${category.category}"?`);
    if (confirmDelete) {
      try {
        const categoryId = category.id;
        const categoryRef = categoriesCollectionRef.doc(categoryId);
        await categoryRef.delete();
        toast.success('Category deleted successfully!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error('Failed to delete category.', { autoClose: 1500, hideProgressBar: true });
      }
    }
  }

  return (
    <AnimatedPage>
      <div className="home-container">
        <div className="content">
          <h1 className="card-view">REWARD PAGE</h1>
          <div className={`floating-form ${showAddForm ? 'visible' : ''}`} ref={formContainerRef}>
            {showAddForm && ( 
              <div className="form-container">
                <div className="form-group">
                  <label htmlFor="category">Category:</label>
                  <input
                    placeholder="Enter Category"
                    type="text"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="categoryPoints">Category Points:</label>
                  <input
                    placeholder="Enter Category Points"
                    type="number"
                    id="categoryPoints"
                    value={categoryPointsInput}
                    onChange={(e) => setCategoryPointsInput(e.target.value)}
                    className="form-control"
                  />
                </div>
                <button onClick={handleAddCategory} className="btn btn-primary">
                  Add Category
                </button>
                <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="tabs">
            <button
              style={selectedTab === "REWARD" ? activeTabStyle : tabStyle}
              onClick={() => handleTabChange("REWARD")}
            >
              Reward
            </button>
          </div>
          {selectedTab === 'REWARD' && (
            <div className="rewards-container">
              <h2>Reward Category</h2>
              <div className="rewards-list">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="reward-item"
                    onClick={() => handleCategoryCardClick(category)}
                  >
                    <h3>{category.category}</h3>
                    <button onClick={(e) => handleUpdateCategory(e, category)} className="btn btn-primary">Update</button>
                    <button onClick={(e) => handleDeleteCategory(e, category)} className="btn btn-secondary">Delete</button>
                  </div>
                ))}
              </div>

              {showCategoryUpdateForm && (
                <div className="category-update-form">
                  <h3>Update Category</h3>
                  <label htmlFor="newCategoryName">New Category Name:</label>
                  <input
                    className="add-input"
                    type="text"
                    id="newCategoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <label htmlFor="newCategoryPoints"> Points:</label>
                  <input
                    className="add-input"
                    type="number"
                    id="newCategoryPoints"
                    value={newCategoryPoints}
                    onChange={(e) => setNewCategoryPoints(e.target.value)}
                  />
                  <button onClick={updateCategory} className="btn btn-primary">
                    Update
                  </button>
                  <button onClick={() => setShowCategoryUpdateForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>

                </div>
              )}
            </div>
          )}
          {showCategoryCard && (
            <>
              <div className="overlay-background"></div>
              <div className="category-card">
                <button onClick={closeCategoryCard} className="close-category-card-button">
                  X
                </button>
                <div className="category-card-content">
                  <button onClick={() => {
                      resetInputFields();
                      setShowAddRewardForm(true);
                    }} className="add-reward-button">
                    ADD REWARD
                    <span className="button__icon" style={{ color: 'white' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                  </button>
                  {showAddRewardForm && (
                    <div className="reward-modal">
                      <h3>Add New Reward</h3>
                      <label htmlFor="newRewardName">Reward Name:</label>
                      <input
                        className="add-input"
                        type="text"
                        id="newRewardName"
                        value={newRewardName}
                        onChange={(e) => setNewRewardName(e.target.value)}
                      />
                      <label htmlFor="newRewardQuantity">Quantity:</label>
                      <input
                        className="add-input"
                        type="number"
                        id="newRewardQuantity"
                        value={newRewardQuantity}
                        onChange={(e) => setNewRewardQuantity(e.target.value)}
                      />
                      <button onClick={addReward} className="btn btn-primary">Add</button>
                      <button onClick={() => setShowAddRewardForm(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                  )}
                  <div className="category-points">
                    <h1 htmlFor="categoryPoints">{selectedCategory && `${selectedCategory}: ${categoryPoints}`}</h1>
                  </div>
                  {rewardsList.map((reward) => (
                    <div key={reward.id} className="reward-item" onClick={() => handleCategoryCardClick(reward)}>
                      <h3>{reward.rewardName}</h3>
                      <p>Stock: {reward.quantity}</p>
                      {editRewardId === reward.id && showRewardUpdateForm ? (
                        <div className="update-form">
                          <h3>Update Reward</h3>
                          <label htmlFor="newRewardName">Reward Name:</label>
                          <input
                            className="add-input"
                            type="text"
                            id="newRewardName"
                            value={newRewardName}
                            onChange={(e) => setNewRewardName(e.target.value)}
                          />
                          <label htmlFor="newRewardQuantity">Quantity:</label>
                          <input
                            className="add-input"
                            type="number"
                            id="newRewardQuantity"
                            value={newRewardQuantity}
                            onChange={(e) => setNewRewardQuantity(e.target.value)}
                          />
                          <button onClick={updateReward} className="btn btn-primary">
                            Update
                          </button>
                          <button onClick={() => setShowRewardUpdateForm(false)} className="btn btn-secondary">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <button onClick={(e) => handleUpdateReward(e, reward)} className="btn btn-primary">
                            Update
                          </button>
                          <button onClick={(e) => handleDeleteReward(e, reward)} className="btn btn-secondary">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className={`floating-button-container ${showCategoryCard ? 'unfocusable' : ''}`}>
            {showAddForm ? (
              <button onClick={() => setShowAddForm(false)} className="floating-add-button">
                -
              </button>
            ) : (
              <button onClick={() => setShowAddForm(true)} className="floating-add-button">
                +
              </button>
            )}
            <div className="indicator-animation">Click me to category!</div>
          </div>
        </div>
        <ToastContainer autoClose={1500} hideProgressBar />
      </div>
    </AnimatedPage>
  );
}

export default React.memo(Reward);