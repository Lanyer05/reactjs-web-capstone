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
import Logos from '../5333978.jpg';

function Reward() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryCard, setShowCategoryCard] = useState(false);
  const navigate = useNavigate();
  const [emptyFieldWarning, setEmptyFieldWarning] = useState(false);
  const [category, setCategory] = useState("");  
  const [categories, setCategories] = useState([]); 
  const [rewardsList, setRewardsList] = useState([]);
  const formContainerRef = useRef(null);
  const [updatingRewardId, setUpdatingRewardId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("REWARD");
  const rewardsCollectionRef = firestore.collection("rewards");
  const categoriesCollectionRef = firestore.collection("categories");
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [newRewardPoints, setNewRewardPoints] = useState("");
  const [showAddRewardForm, setShowAddRewardForm] = useState(false);
  const [showAddRewardForms, setShowAddRewardForms] = useState(false);
  const [editRewardId, setEditRewardId] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [categoryPoints, setCategoryPoints] = useState(""); 
  const [categoryPointsInput, setCategoryPointsInput] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryPoints, setNewCategoryPoints] = useState("");
  const [showCategoryUpdateForm, setShowCategoryUpdateForm] = useState(false);
  const [showRewardUpdateForm, setShowRewardUpdateForm] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const couponsCollectionRef = firestore.collection("coupons");
  const [expandedCouponId, setExpandedCouponId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardQuantity, setNewRewardQuantity] = useState('');

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
    if (!category || !categoryPointsInput) {
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
    if (!newRewardName || isNaN(newRewardQuantity) || !selectedCategory) {
      setEmptyFieldWarning(true);
      toast.error('Please fill in all required fields with valid values.', { autoClose: 1500, hideProgressBar: true });
      return;
    }
    try {
      const categoryPoints = categories.find((cat) => cat.category === selectedCategory).points;
  
      const newReward = {
        category: selectedCategory,
        rewardName: newRewardName,
        points: categoryPoints.toString(),
        quantity: parseInt(newRewardQuantity, 10),
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
    setShowAddRewardForms(false);
    setCategoryPoints(category.points);
  };

  const closeCategoryCard = () => {
    setSelectedCategory(null); 
    setShowCategoryCard(false);
  }

  const tabStyle = {
    fontSize: "16px",
    fontWeight: "bold",
    padding: "10px 20px",
    margin: "0 1px",
    marginBottom: "5px",
    color: "white",
    backgroundColor: '#00A871',
    border: "1px solid rgb(7, 110, 50)",
    cursor: "pointer",
    width: "170px",
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
    const parsedQuantity = parseInt(newRewardQuantity, 10);
    if (!newRewardName || isNaN(parsedQuantity) || parsedQuantity < 0 || !selectedCategory) {
      setEmptyFieldWarning(true);
      toast.error('Please fill in all required fields with valid values.', { autoClose: 1500, hideProgressBar: true });
      return;
    }
  
    try {
      const updatedReward = {
        category: selectedCategory,
        rewardName: newRewardName,
        points: categoryPoints, 
        quantity: parsedQuantity,
      };
  
      const rewardRef = rewardsCollectionRef.doc(editRewardId);
      await rewardRef.update(updatedReward);
      toast.success('Reward updated successfully!', { autoClose: 1500, hideProgressBar: true });
      setNewRewardName("");
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
    setNewRewardQuantity(reward.quantity.toString());
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
      const categorySnapshot = await categoryRef.get();
      const currentCategoryData = categorySnapshot.data();
      await categoryRef.update({
        category: newCategoryName,
        points: newCategoryPoints,
      });
      const updatedCategoryName = newCategoryName;
      const pointsBatch = firebase.firestore().batch();
      const rewardsQueryPoints = await rewardsCollectionRef.where('category', '==', currentCategoryData.category).get();
  
      rewardsQueryPoints.forEach((rewardDoc) => {
        const rewardRef = rewardsCollectionRef.doc(rewardDoc.id);
        pointsBatch.update(rewardRef, {
          points: newCategoryPoints,
          category: updatedCategoryName,
        });
      });
      await pointsBatch.commit();
      toast.success('Category and associated rewards updated!', { autoClose: 1500, hideProgressBar: true });
      setShowUpdateForm(false);
    } catch (error) {
      console.error("Error updating category and associated rewards:", error);
      toast.error('Failed to update category and associated rewards.', { autoClose: 1500, hideProgressBar: true });
    }
  };
  

  const handleDeleteCategory = async (e, category) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Are you sure you want to delete the category "${category.category}"?`);
    
    if (confirmDelete) {
      try {
        const categoryId = category.id;
        const categoryRef = categoriesCollectionRef.doc(categoryId);
  
        const rewardsQuerySnapshot = await rewardsCollectionRef
          .where('category', '==', category.category)
          .where('points', '==', category.points)
          .get();
  
        const deletePromises = rewardsQuerySnapshot.docs.map(async (rewardDoc) => {
          const rewardId = rewardDoc.id;
          const rewardRef = rewardsCollectionRef.doc(rewardId);
          await rewardRef.delete();
        });
  
        await Promise.all(deletePromises);
  
        await categoryRef.delete();
        toast.success('Category and associated rewards deleted successfully!', { autoClose: 1500, hideProgressBar: true });
      } catch (error) {
        console.error("Error deleting category and associated rewards:", error);
        toast.error('Failed to delete category and associated rewards.', { autoClose: 1500, hideProgressBar: true });
      }
    }
  };


  const deleteZeroQuantityRewards = async () => {
    try {
      const rewardsSnapshot = await firebase.firestore().collection('rewards').get();
      rewardsSnapshot.forEach(async (doc) => {
        const quantity = doc.data().quantity;
        if (quantity === 0) {
          await firebase.firestore().collection('rewards').doc(doc.id).delete();
          console.log(`Reward ${doc.id} with quantity 0 has been deleted.`);
        }
      });
    } catch (error) {
      console.error('Error deleting rewards with quantity 0:', error);
    }
  };
  
  useEffect(() => {
    deleteZeroQuantityRewards();
  }, []);
  

  useEffect(() => {
    const unsubscribeCoupons = couponsCollectionRef.onSnapshot((snapshot) => {
      const couponsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        selectedItems: doc.data().selectedItems || [], 
      }));
      setCoupons(couponsData);
    });

    return () => {
      unsubscribeCoupons();
    };
  }, []);


  const handleToggle = (couponId) => {
    setExpandedCouponId((prevId) => (prevId === couponId ? null : couponId));
  };


  const claimReward = async (couponCode) => {
    try {
      const couponRef = couponsCollectionRef.where("couponCode", "==", couponCode).limit(1);
      const snapshot = await couponRef.get();
  
      if (!snapshot.empty) {
        const couponDoc = snapshot.docs[0];
        const couponId = couponDoc.id;
  
        // Get the current date and time
        const currentDateTime = new Date();
        const formattedDateTime = `${currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} | ${currentDateTime.toLocaleDateString()}`;
  
        await couponsCollectionRef.doc(couponId).update({
          isClaimed: true,
          claimDateTime: formattedDateTime,
        });
  
        toast.success(`Reward claimed successfully!`, {
          autoClose: 1500,
          hideProgressBar: true,
        });
      } else {
        toast.error(`Coupon with code ${couponCode} not found.`, {
          autoClose: 1500,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast.error(`Failed to claim reward for coupon: ${couponCode}`, {
        autoClose: 1500,
        hideProgressBar: true,
      });
    }
  };
  


  return (
    <AnimatedPage>
      <div className="home-container">
        <div className="content">
        <img src={Logos} alt="Welcome"style={{position: 'fixed',bottom: 0,left: 0,width: '100%',height: 'auto',objectFit: 'cover',zIndex: -1,opacity: 0.4,}}/>
          <h1 className="card-view">REWARD PAGE</h1>
          <div className={`floating-form ${showAddRewardForm ? 'visible' : ''}`} ref={formContainerRef}>
            {showAddRewardForm && (
              <div className="reward-modal">
                <h3 style={{ textAlign: 'center' }}>Add Reward</h3>
                <label htmlFor="newRewardCategory">Category:</label>
                <select style={{marginBottom:'10px'}}
                  id="newRewardCategory"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="add-input"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
                <label htmlFor="newRewardName">Reward Name:</label>
                <input
                  placeholder="Enter Reward"
                  className="add-input"
                  type="text"
                  id="newRewardName"
                  value={newRewardName}
                  onChange={(e) => setNewRewardName(e.target.value)}
                  style={{ backgroundColor: 'white' }}
                />
                <label htmlFor="newRewardQuantity">Quantity:</label>
                <input
                  placeholder="Enter Quantity"
                  className="add-input"
                  type="number"
                  id="newRewardQuantity"
                  value={isNaN(newRewardQuantity) ? '' : newRewardQuantity.toString()}
                  onChange={(e) => setNewRewardQuantity(Math.max(0, parseInt(e.target.value, 10)))}
                  min="0"
                  style={{ backgroundColor: 'white' }}
                />
                <button onClick={addReward} className="btn btn-primary">
                  Add Reward
                </button>
                <button onClick={() => setShowAddRewardForm(false)} className="btn btn-secondary">
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
            <button
                  style={selectedTab === 'REDEEM' ? activeTabStyle : tabStyle}
                  onClick={() => handleTabChange('REDEEM')}>
                  Coupon Code
            </button>
            <button
                  style={selectedTab === 'COMPLETE' ? activeTabStyle : tabStyle}
                  onClick={() => handleTabChange('COMPLETE')}>
                  Complete
            </button>
          </div>
          {selectedTab === 'REWARD' && (
            <div className="rewards-container">
              <h2>Category & Rewards</h2>
              <div className="rewards-list">
              {categories.slice().reverse().map((category) => (
                  <div
                    key={category.id}
                    className="reward-item"
                    onClick={() => handleCategoryCardClick(category)}
                    title="Click to add rewards"
                  >
                    <h3>{category.category}</h3>
                    <button onClick={(e) => handleUpdateCategory(e, category)} className="btn btn-primary">Update</button>
                    <button onClick={(e) => handleDeleteCategory(e, category)} className="btn btn-secondary">Delete</button>
                  </div>
                ))}
                {categories.length === 0 && <p>No categories found.</p>}
                <div className="reward-items" onClick={setShowAddForm}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '4em', cursor: 'pointer', fontWeight: 'bold' }}>
                        +
                      </span>
                    <h3>ADD CATEGORY</h3>
                  </div>
                </div> 
                <div className={`floating-form ${showAddForm ? 'visible' : ''}`} ref={formContainerRef}style={{ backdropFilter: 'blur(5px)', zIndex: 999 }}>
                  {showAddForm && ( 
                    <div className="form-container">
                      <div className="form-group">
                      <h3 style={{textAlign:'center'}}>Add Reward Category</h3>
                        <label htmlFor="category">Category Name:</label>
                        <input
                          placeholder="Enter Category"
                          type="text"
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="form-control"
                          style={{ backgroundColor: 'white' }}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="categoryPoints">Category Points:</label>
                        <input
                          placeholder="Enter Category Points"
                          type="number"
                          id="categoryPoints"
                          value={categoryPointsInput}
                          onChange={(e) => setCategoryPointsInput(Math.max(0, parseInt(e.target.value, 10)))}
                          className="form-control"
                          min="0"
                          style={{ backgroundColor: 'white' }}
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
              </div>

              {showCategoryUpdateForm && (
                <div className="category-update-form">
                  <h3>Update Reward Category</h3>
                  <label htmlFor="newCategoryName">New Reward Category Name:</label>
                  <input
                    className="add-input"
                    type="text"
                    id="newCategoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    style={{ backgroundColor: 'white' }}
                  />
                  <label htmlFor="newCategoryPoints"> Points:</label>
                  <input
                    className="add-input"
                    type="number"
                    id="newCategoryPoints"
                    value={newCategoryPoints}
                    onChange={(e) => setNewCategoryPoints(e.target.value)}
                    style={{ backgroundColor: 'white' }}
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
                      setShowAddRewardForms(true);
                    }} className="add-reward-button">
                    ADD REWARD
                    <span className="button__icon" style={{ color: 'white' }}>
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                  </button>
                  {showAddRewardForms && (
                    <div className="reward-modal">
                      <h3>Add Reward</h3>
                      <label htmlFor="newRewardName">Reward Name:</label>
                      <input
                        className="add-input"
                        type="text"
                        id="newRewardName"
                        value={newRewardName}
                        onChange={(e) => setNewRewardName(e.target.value)}
                        style={{ backgroundColor: 'white' }}
                      />
                      <label htmlFor="newRewardQuantity">Quantity:</label>
                        <input
                          className="add-input"
                          type="number"
                          id="newRewardQuantity"
                          value={newRewardQuantity}
                          onChange={(e) => setNewRewardQuantity(Math.max(0, parseInt(e.target.value, 10)))}
                          min="0"
                          style={{ backgroundColor: 'white' }}
                        />
                      <button onClick={addReward} className="btn btn-primary">Add</button>
                      <button onClick={() => setShowAddRewardForms(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                  )}
                  <div className="category-points">
                    <h1 htmlFor="categoryPoints">{selectedCategory && `${selectedCategory}: ${categoryPoints}`}</h1>
                  </div>
                    {rewardsList.slice().reverse().map((reward) => (
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
                            style={{ backgroundColor: 'white' }}
                          />
                          <label htmlFor="newRewardQuantity">Quantity:</label>
                            <input
                              className="add-input"
                              type="number"
                              id="newRewardQuantity"
                              value={newRewardQuantity}
                              onChange={(e) => setNewRewardQuantity(Math.max(0, parseInt(e.target.value, 10)))}
                              min="0"
                              style={{ backgroundColor: 'white' }}
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
                  {rewardsList.length === 0 && <p>No Rewards found.</p>}
                </div>
              </div>
            </>
          )}
          {selectedTab === 'REWARD' && (
          <div className={`floating-button-container ${showCategoryCard ? 'unfocusable' : ''}`}>
            {showAddRewardForm ? (
              <button onClick={() => setShowAddRewardForm(false)} className="floating-add-button" style={{ fontSize: '3em'}}>
                -
              </button>
            ) : (
              <button onClick={() => setShowAddRewardForm(true)} className="floating-add-button" style={{ fontSize: '2em'}}>
                +
              </button>
            )}
            <div className="indicator-animation">Add Rewards</div>
          </div>
        )}

        {selectedTab === 'REDEEM' && (
          <div className="claim-container">
            <h2>Redeem Rewards</h2>
            <div className="claim-list">
            {coupons
              .filter((coupon) => !coupon.isClaimed).slice().reverse().map((coupon) => (
                <div key={coupon.id} className="claim-item" onClick={() => handleToggle(coupon.id)}>
                <div className="claim-details">
                  <h3>{coupon.couponCode}</h3>
                  <p>
                    <span className="label">Email:</span>
                    {coupon.email}
                  </p>
                  <p>
                    <span className="label">User ID:</span>
                    {coupon.userId}
                  </p>
                  {coupon.selectedItems && coupon.selectedItems.length > 0 && (
                    <>
                      <p className="label">
                        Rewards: {' '}
                        <span
                          className="expand-indicator"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(coupon.id);
                          }}>
                          {expandedCouponId === coupon.id ? '▲ Collapse ▲' : '▼ Expand ▼'}
                        </span>
                      </p>
                      {expandedCouponId === coupon.id && (
                        <table className="reward-table">
                          <thead>
                            <tr>
                              <th>Reward Name</th>
                              <th>Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                          {coupon.selectedItems.slice().reverse().map((item, index) => (
                              <tr key={index}>
                                <td>{item.rewardId}</td>
                                <td>{item.selectedQuantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  )}
                </div>
                {expandedCouponId === coupon.id && (
                  <div className="claim-actions">
                    <button onClick={() => claimReward(coupon.couponCode)} className="confirm-button">
                      Claim
                    </button>
                  </div>
                )}
              </div>              
              ))}
              {coupons.filter((coupon) => !coupon.isClaimed).length === 0 && <p>No Coupons found.</p>}
            </div>
          </div>
        )}

        {selectedTab === 'COMPLETE' && (
          <div className="claim-container">
            <h2>Complete Redemption</h2>
            <div className="claim-list">
            {coupons.filter((coupon) => coupon.isClaimed).slice().reverse().map((coupon) => (
            <div key={coupon.id} className="reward-claim-item" onClick={() => handleToggle(coupon.id)}>
                  <div className="reward-claim-details">
                    <h3 className="red-highlight">{coupon.couponCode}</h3>
                    <p>
                      <span className="label">Email:</span>
                      {coupon.email}
                    </p>
                    <p>
                      <span className="label">User ID:</span>
                      {coupon.userId}
                    </p>
                    <p>
                      <span className="label">Claim Date</span>
                      {coupon.claimDateTime}
                    </p>
                    {coupon.selectedItems && coupon.selectedItems.length > 0 && (
                      <>
                        <p className="label">
                        Rewards: {' '}
                        <span
                          className="expand-indicator"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(coupon.id);
                          }}>
                          {expandedCouponId === coupon.id ? '▲ Collapse ▲' : '▼ Expand ▼'}
                        </span>
                      </p>
                        {expandedCouponId === coupon.id && (
                          <table className="reward-table">
                            <thead>
                              <tr>
                                <th>Reward Name</th>
                                <th>Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                            {coupon.selectedItems.slice().reverse().map((item, index) => (
                                <tr key={index}>
                                  <td>{item.rewardId}</td>
                                  <td>{item.selectedQuantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              {coupons.filter((coupon) => coupon.isClaimed).length === 0 && <p>No claimed coupons found.</p>}
            </div>
          </div>
        )}

       </div>  
        <ToastContainer autoClose={1500} hideProgressBar />
      </div>
    </AnimatedPage>
  );
}

export default React.memo(Reward);