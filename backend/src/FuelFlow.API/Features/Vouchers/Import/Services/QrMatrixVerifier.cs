using System.Collections.Generic;
using ZXing;
using ZXing.Common;
using ZXing.QrCode.Internal;

namespace FuelFlow.Features.Vouchers.Import;

public static class QrMatrixVerifier
{
    private const double WarningThresholdPercent = 1.0;
    private const double FailureThresholdPercent = 2.0;

    public enum VerificationResult
    {
        Passed,
        Warning,
        Failed,
        Skipped
    }

    public sealed class VerificationDetails
    {
        public VerificationResult Result { get; init; }
        public double MismatchPercent { get; init; }
        public int MismatchedModules { get; init; }
        public int TotalModules { get; init; }
        public string? SkipReason { get; init; }
    }

    public static VerificationDetails Verify(
        string payload,
        bool[,]? originalMatrix,
        string? eccLevel,
        int? version,
        string? encodingMode,
        int? maskPattern)
    {
        if (originalMatrix == null)
            return new VerificationDetails { Result = VerificationResult.Skipped, SkipReason = "Original matrix not available" };

        if (version == null || maskPattern == null)
            return new VerificationDetails { Result = VerificationResult.Skipped, SkipReason = "Version or mask pattern not extracted" };

        bool[,] regenerated;
        try
        {
            regenerated = GenerateMatrixZxing(payload, eccLevel ?? "L", version.Value, maskPattern.Value, encodingMode);
        }
        catch (Exception ex)
        {
            return new VerificationDetails { Result = VerificationResult.Skipped, SkipReason = $"Failed to regenerate QR for comparison: {ex.Message}" };
        }

        return CompareModules(originalMatrix, regenerated);
    }

    private static bool[,] GenerateMatrixZxing(
        string payload, string eccLevel, int version, int maskPattern, string? encodingMode)
    {
        var ecLevel = eccLevel switch
        {
            "L" => ErrorCorrectionLevel.L,
            "M" => ErrorCorrectionLevel.M,
            "Q" => ErrorCorrectionLevel.Q,
            "H" => ErrorCorrectionLevel.H,
            _ => ErrorCorrectionLevel.L
        };

        var hints = new Dictionary<EncodeHintType, object>
        {
            { EncodeHintType.QR_VERSION, version },
            { EncodeHintType.QR_MASK_PATTERN, maskPattern },
            { EncodeHintType.CHARACTER_SET, "UTF-8" }
        };

        var qrCode = Encoder.encode(payload, ecLevel, hints);
        var matrix = qrCode.Matrix;
        int dim = matrix.Width;
        var result = new bool[dim, dim];
        for (int x = 0; x < dim; x++)
            for (int y = 0; y < dim; y++)
                result[x, y] = matrix[x, y] == 1;

        return result;
    }

    private static VerificationDetails CompareModules(bool[,] original, bool[,] regenerated)
    {
        int dim = original.GetLength(0);

        if (dim != regenerated.GetLength(0))
            return new VerificationDetails
            {
                Result = VerificationResult.Failed,
                MismatchPercent = 100,
                MismatchedModules = dim * dim,
                TotalModules = dim * dim,
                SkipReason = $"Size mismatch: original={dim} regenerated={regenerated.GetLength(0)}"
            };

        int mismatched = 0;
        int total = dim * dim;
        (int X, int Y) firstMismatch = (-1, -1);

        for (int x = 0; x < dim; x++)
            for (int y = 0; y < dim; y++)
                if (original[x, y] != regenerated[x, y])
                {
                    mismatched++;
                    if (firstMismatch.X == -1)
                        firstMismatch = (x, y);
                }

        double mismatchPercent = (double)mismatched / total * 100.0;

        var result = mismatchPercent <= WarningThresholdPercent
            ? VerificationResult.Passed
            : mismatchPercent <= FailureThresholdPercent
                ? VerificationResult.Warning
                : VerificationResult.Failed;

        if (mismatched > 0)
        {
            Console.WriteLine(
                $"[QrMatrixVerifier] Version={dim} " +
                $"Mismatches={mismatched}/{total} First mismatch at (x={firstMismatch.X}, y={firstMismatch.Y}) " +
                $"original={original[firstMismatch.X, firstMismatch.Y]} regenerated={regenerated[firstMismatch.X, firstMismatch.Y]}");
        }

        return new VerificationDetails
        {
            Result = result,
            MismatchPercent = mismatchPercent,
            MismatchedModules = mismatched,
            TotalModules = total
        };
    }
}
