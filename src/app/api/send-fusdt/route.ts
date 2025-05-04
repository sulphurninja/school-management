import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { authenticated } from "@/lib/auth";

const FUSDT_CONTRACT_ADDRESS = process.env.FUSDT_CONTRACT_ADDRESS!;
const PRIVATE_KEY = process.env.FUSDT_PRIVATE_KEY!;
const RPC_URL = process.env.FUSDT_RPC_URL!;

const ABI = [
  "function transfer(address _to, uint256 _value) public returns (bool)",
  "function decimals() view returns (uint8)",
];

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const userData = await authenticated(req);
    if (!userData.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { to, amount } = await req.json();

    if (!to || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get user from database
    const user = await User.findById(userData.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has enough bandwidth
    if (user.bandwidth < parseFloat(amount)) {
      return NextResponse.json(
        { success: false, error: "Insufficient bandwidth to send this amount" },
        { status: 400 }
      );
    }

    // Connect to blockchain and send the FUSDT
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(FUSDT_CONTRACT_ADDRESS, ABI, wallet);

    const decimals = await contract.decimals();
    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

    const tx = await contract.transfer(to, parsedAmount);
    await tx.wait();

    // Deduct bandwidth from user's account
    user.bandwidth -= parseFloat(amount);

    // Record the transaction in user's history
    user.transactions.push({
      type: 'send',
      amount: parseFloat(amount),
      recipient: to,
      date: new Date(),
      hash: tx.hash
    });

    await user.save();

    return NextResponse.json({
      success: true,
      hash: tx.hash,
      remainingBandwidth: user.bandwidth
    });
  } catch (error: any) {
    console.error("FUSDT transfer error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
