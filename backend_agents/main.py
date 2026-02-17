import streamlit as st
import sys
import os

# Add the current directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from crewai import Crew, Process
from agents import PurposePayAgents
from tasks import PurposePayTasks

# --- Streamlit Config ---
st.set_page_config(page_title="PurposePay Simulation", page_icon="💳", layout="wide")

# Custom CSS for "Cyber" look
st.markdown("""
    <style>
        .stApp {
            background-color: #050a14;
            color: #ffffff;
        }
        .stButton>button {
            background-color: #00ff9d;
            color: #000000;
            border-radius: 12px;
            font-weight: bold;
            border: none;
        }
        .stTextInput>div>div>input {
            background-color: #1a1f2e;
            color: #ffffff;
            border: 1px solid #3333e6;
        }
        h1, h2, h3 {
            color: #00ff9d !important;
        }
    </style>
""", unsafe_allow_html=True)

st.title("💳 PurposePay Agent Swarm")
st.markdown("### Closed-Loop Credit System for Financial Inclusion")

# --- Sidebar Inputs ---
st.sidebar.header("Configuration")
if "OPENAI_API_KEY" not in os.environ:
    api_key = st.sidebar.text_input("OpenAI API Key", type="password")
    if api_key:
        os.environ["OPENAI_API_KEY"] = api_key
else:
    st.sidebar.success("API Key detected in environment")

st.sidebar.header("Loan Request Details")
item = st.sidebar.selectbox("Select Product", ["Urea Fertilizer", "DAP Fertilizer", "Hybrid Seeds"])
quantity = st.sidebar.number_input("Quantity (bags)", min_value=1, value=50)
vendor_id = st.sidebar.text_input("Vendor ID", value="V-9988")
farmer_id = st.sidebar.text_input("Farmer ID", value="F-1024")

# --- Main Execution ---
if st.button("🚀 Initiate Loan Request"):
    
    # 1. Instantiate Agents & Tasks
    agents = PurposePayAgents()
    tasks = PurposePayTasks()

    broker = agents.broker_agent()
    escrow = agents.escrow_agent()
    recovery = agents.recovery_agent()

    # Define Tasks
    task1 = tasks.verify_purchase_task(broker, item, quantity, vendor_id)
    # Note: In a real app, we'd pass output of task1 to task2 dynamically. 
    # For this demo, we assume the flow continues.
    task2 = tasks.execute_payment_task(escrow, "Verified Purchase Order") 
    task3 = tasks.recover_loan_task(recovery, farmer_id)

    # 2. Create Crew
    crew = Crew(
        agents=[broker, escrow, recovery],
        tasks=[task1, task2, task3],
        verbose=True,  # Changed from verbose=2 to verbose=True (bool) or integer logging level if supported
        process=Process.sequential
    )

    with st.spinner("Agents are processing your request..."):
        # 3. Kickoff
        result = crew.kickoff()

    st.success("Transaction Cycle Complete!")
    
    st.markdown("---")
    st.subheader("📝 Agent Execution Log")
    st.text_area("Final Audit Trail", result, height=300)

    # Visual Flow
    col1, col2, col3 = st.columns(3)
    with col1:
        st.info("**Broker Agent**\n\n✅ Price Verified\n✅ Invoice Approved")
    with col2:
        st.success("**Escrow Agent**\n\n💸 Payment Sent to Vendor\n🔒 Loan Locked")
    with col3:
        st.warning("**Recovery Agent**\n\n🌾 Harvest Sale Detected\n💰 Auto-Repayment Done")

else:
    st.info("Configure the loan details in the sidebar and click 'Initiate' to start the agent swarm.")
